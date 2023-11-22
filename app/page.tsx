import Image from 'next/image'
"use client"
import { ChangeEvent, useEffect, useState } from 'react';

export default function Home() {

  const [file,setFile]= useState<File | undefined>(undefined);
  const [us,setUs]=useState("initial");
  const [progress, setProgress] = useState(0);
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };
  const handleSubmit=async(e:any)=>{
    e.preventDefault();
    try{
      if(!file)
      {
        return;
      }
   
      const data = new FormData()
       data.set('file', file);
   
       setUs("progress");
    
     const res = await fetch('/api/handleupload', {method:"POST",body:data});
      console.log("done");
      
      setUs("initial");

      if (!res.ok) throw new Error();
    }
    catch(e){
      setUs("failed");
      console.log(e);
      throw new Error();
    }
  }
  return (
    <form onSubmit={(e)=>handleSubmit(e)}>

        
    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" > Supported file formats <span className="text-red-500">[max 10MB]</span> : PNG, TIFF, JPG, PSD, AI, PDF, SVG, CDR, DOCX, PPTX, EPS, ZIP</label>
    <input className="block w-full text-sm text-gray-900 p-1 border border-DMWarning rounded-lg cursor-pointer bg-DMWarning dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="file_input" type="file" onChange={handleFileChange}/>
    <button type="submit">submit</button>
        </form>
  )
}
