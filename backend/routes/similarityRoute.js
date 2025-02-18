import express from 'express';
import Project from '../models/Project.js';
import natural from 'natural';

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
    const projects = await Project.find({}, "title description");
    if (projects.length === 0) {
      return res.json({ message: "No similar projects found", similarProjects: [] });
    }

    // **Combine title & description for better results**
    const inputText = `${title} ${description}`;
    const projectTexts = projects.map(p => `${p.title} ${p.description}`);
    const similarityScores = computeSimilarity(inputText, projectTexts);

    console.log(similarityScores);  // Debugging

    // **Set an optimized threshold**
    const threshold = 0.4; 
    const similarProjects = projects.filter((p, index) => similarityScores[index].score >= threshold);
  
    if(similarProjects.length>=1){
      res.json({
        msg:"Your project get rejected bcz of the repitition with below",
        similarProjects
      })
    }else{
      res.json({msg:"No duplication u can submit"})
    }

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
