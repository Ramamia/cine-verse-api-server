import express from "express";

const app = express();
const PORT = 3000;

//test endpoint
//the request here is localhost:3000/
app.get("/", (req, res) => {
    res.send("Cine-Verse server is running yay");
});

app.use((req,res) => {
    res.status(404).json({
        error: "Not Found"
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); //takes port number and callback function 


