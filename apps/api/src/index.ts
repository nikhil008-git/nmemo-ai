
//@ts-ignore
import express from "express";


const app = express();

app.listen(8080, () => {
    console.log("Backend running on http://localhost:8080");
});

console.log('done check')
