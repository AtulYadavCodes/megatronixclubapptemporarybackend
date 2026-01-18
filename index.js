import express, { response } from 'express';
import multer from 'multer';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

import { main } from './web.js';
import cors from 'cors';
//import pdf from 'pdf-parse';
//const uploadedpath="";
const app=express();
app.use(express.json()); app.use(cors(
    {
    origin:'*'
}));
const port =3000;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage: storage })

app.post('/file',upload.single('file'),async(req,res)=>{
    const uploadedpath=req.file.path;

    res.status(200).send(await extractpdf(uploadedpath));
});
// async function extractpdf(filepath){
//     const databuffer = await fs.readFile(filepath);
//     const data= await pdf(databuffer);
// }


async function extractpdf(filepath){ //ocr space api

    const form=new FormData();
form.append('apikey','d4bcd084f588957');
form.append('file',fs.createReadStream(filepath));

    try{
       const response= await axios({
            method:'post',
            url:'https://api.ocr.space/parse/image',
            data: form,
            headers:{
                ...form.getHeaders()
            }
        })
        
        const resume =  response.data.ParsedResults[0].ParsedText
       console.log('Extracted Resume Text:', resume);
       return await main(resume);
    }
    catch(error){
        console.error('Error extracting PDF:',error);
    }
}


app.listen(port,()=>{
console.log(`Server is running at http://localhost:${port}`);
});
