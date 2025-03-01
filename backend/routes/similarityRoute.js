import express from 'express';
import Project from '../models/Project.js';
import natural from 'natural';
import User from '../models/User.js';

const router = express.Router();
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

// **Function to compute similarity using TF-IDF + Cosine Similarity**
const computeSimilarity = (inputText, projectTexts) => {
  const tfidf = new TfIdf();

  // **Preprocess: Lowercase and tokenize input**
  const processedInput = tokenizer.tokenize(inputText.toLowerCase()).join(" ");
  tfidf.addDocument(processedInput);

  projectTexts = projectTexts.map(text => tokenizer.tokenize(text.toLowerCase()).join(" "));
  projectTexts.forEach(text => tfidf.addDocument(text));

  // **Compute similarity scores manually**
  let similarities = [];
  projectTexts.forEach((text, index) => {
    let inputVector = [];
    let docVector = [];

    // Extract unique terms
    tfidf.listTerms(0).forEach(term => {
      inputVector.push(term.tfidf);
      let docTerm = tfidf.listTerms(index + 1).find(t => t.term === term.term);
      docVector.push(docTerm ? docTerm.tfidf : 0);
    });

    // **Compute Cosine Similarity**
    const dotProduct = inputVector.reduce((sum, val, i) => sum + val * docVector[i], 0);
    const magnitudeA = Math.sqrt(inputVector.reduce((sum, val) => sum + val ** 2, 0));
    const magnitudeB = Math.sqrt(docVector.reduce((sum, val) => sum + val ** 2, 0));
    let score = magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;

    similarities.push({ text, score });
  });

  return similarities;
};

// **Route to check project similarity**
router.post("/check-similarity", async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  try {
    const projects = await Project.find({}, "title description studentId"); // Fetch studentId along with title & description
    if (projects.length === 0) {
      return res.json({ message: "No similar projects found", similarProjects: [] });
    }

    // **Combine title & description for better results**
    const inputText = `${title} ${description}`;
    const projectTexts = projects.map((p) => `${p.title} ${p.description}`);
    const similarityScores = computeSimilarity(inputText, projectTexts);

    console.log(similarityScores); // Debugging

    // **Set an optimized threshold**
    const threshold = 0.4;
    let similarProjects = projects.filter((p, index) => similarityScores[index].score >= threshold);

    if (similarProjects.length >= 1) {
      // **Extract studentIds from similar projects**
      const studentIds = similarProjects.map((p) => p.studentId);

      // **Fetch user details**
      const users = await User.find({ _id: { $in: studentIds } }, "name"); // Fetch namem of users

      return res.json({
        msg: "Your project was rejected due to similarity with the following projects",
        similarProjects,
        users,
      });
    } else {
      return res.json({ msg: "No duplication, you can submit" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
