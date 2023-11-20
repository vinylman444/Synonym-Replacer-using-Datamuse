import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/replace', async (req, res) => {
    const inputText = req.body.text;

    async function getSynonym(word) {
        const apiUrl = `https://api.datamuse.com/words?rel_syn=${word}`;
        try {
            const response = await axios.get(apiUrl);
            const synonyms = response.data;

            if (synonyms.length > 0) {
                // Return the closest match
                return synonyms[0].word;
            } else {
                // If no synonym is found, return the original word
                return word;
            }
        } catch (error) {
            console.error('Error fetching synonym:', error);
            return word; // Return the original word in case of an error
        }
    }

    async function replaceWithSynonyms(text) {
        const words = text.split(/\b/); // Split text into words and punctuation
        const processedWords = words.map(async (word) => {
            if (word.match(/^\w+$/)) { // Check if the 'word' is actually a word and not punctuation
                return await getSynonym(word);
            } else {
                return word;
            }
        });

        const newText = await Promise.all(processedWords);
        return newText.join('');
    }

    // Call the replaceWithSynonyms function and send the response
    try {
        const replacedText = await replaceWithSynonyms(inputText);
        res.send(replacedText);
    } catch (error) {
        console.error('Error in replaceWithSynonyms:', error);
        res.status(500).send('An error occurred while processing the text.');
    }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
