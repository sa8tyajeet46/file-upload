import https from "https";
import {
    AbortMultipartUploadCommand,
    CompleteMultipartUploadCommand,
    CreateMultipartUploadCommand,
    S3Client,
    UploadPartCommand
  } from "@aws-sdk/client-s3"
 
  import axios from "axios";
  import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
  import fs from "fs"
  import { readFile, writeFile } from "fs/promises";
  import { NextResponse } from "next/server";
  import { PutObjectCommand } from "@aws-sdk/client-s3";
  import {
    getSignedUrl,
    S3RequestPresigner,
  } from "@aws-sdk/s3-request-presigner";
  // import multer from "multer";
  // import  multerS3 from "multer-s3";
  // import { json } from 'express';
// const upload = multer({
  //   storage: multerS3({
  //     s3: s3,
  //     bucket: 'YOUR_BUCKET_NAME',
  //     acl: 'public-read',
  //     contentType: multerS3.AUTO_CONTENT_TYPE,
  //     key: function (req, file, cb) {
  //       cb(null, Date.now().toString() + '-' + file.originalname);
  //     }
  //   })
  // });
  // export const config = {
  //   api: {
  //     bodyParser: false,
  //   
  // };

  
  function put(url:any, data:any) {
    return new Promise((resolve, reject) => {
      const req = https.request(
        url,
        { method: "PUT", headers: { "Content-Length": new Blob([data]).size } },
        (res) => {
          let responseBody = "";
          res.on("data", (chunk) => {
            responseBody += chunk;
          });
          res.on("end", () => {
            resolve(responseBody);
          });
        },
      );
      req.on("error", (err) => {
        reject(err);
      });
      req.write(data);
      req.end();
    });
  }
  function get(url:any) {
    return new Promise((resolve, reject) => {
      const req = https.get(url, (res) => {
        let responseBody = '';
  
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
  
        res.on('end', () => {
          resolve(responseBody);
        });
      });
  
      req.on('error', (err) => {
        reject(err);
      });
  
      req.end();
    });
  }

   export async function  POST (req:any, res:any,next:any) {
   
    
      if (req.method === 'POST') {
        try{
         
        const data = await req.formData();
    const tfile: File | null = data.get('file') as unknown as File;
   
     
    const bytes = await tfile.arrayBuffer()
    const buffer = Buffer.from(bytes)
   
    // With the file data in the buffer, you can do whatever you want with it.
    // For this, we'll just write it to the filesystem in a new location
    // const path = `/tmp/${tfile.name}`
   
    // await writeFile(path, buffer);
    // const file=await readFile(path);
    // const clientUrl = await createPresignedUrlWithClient(
    //   "theprintguy-customerfiles",`${tfile.name}`
    // );
    // await put(clientUrl, buffer);
    // const file:any=await get(clientUrl);
    
    if(!tfile)
    {
        return NextResponse.json({ok:false,message:"file not found"});
    }
              if(tfile.size>2*1024*1024*1024)
    {
        return NextResponse.json({ok:false,message:"maximum file size is upto 2 gb"});
    }

  
         
            let key=`${Date.now()}+${tfile.name}`;
            const s3Client = new S3Client({
                region: "ap-south-1",
                credentials: fromCognitoIdentityPool({
                  clientConfig: { region: "eu-south-1" },
                  identityPoolId: "eu-north-1:6882a53f-ea7c-49cb-b0b6-bea5052ec264",
                  
                }),  
                 
              });
              const bucketName = "theprintguy-customerfiles";
              let uploadId;
    
      try {
        const multipartUpload = await s3Client.send(
          new CreateMultipartUploadCommand({
            Bucket: bucketName,
            ExpectedBucketOwner:"200994887321",
            Key: key,
            
          }),
        );
    
        uploadId = multipartUpload.UploadId;
    
        // const byteData=await file;
        // const buffer = Buffer.from(file);
        const uploadPromises = [];
        
        const partSize = 5*1024*1024;
    
    
        for (let i = 0; i < Math.ceil(buffer.length / partSize); i++) {
          const start = i * partSize;
          const end = Math.min((i + 1) * partSize, buffer.length);
          let part =   buffer.slice(start, end);
          uploadPromises.push(
            s3Client
              .send(
                new UploadPartCommand({
                  Bucket: bucketName,
                  Key: key,
                  ExpectedBucketOwner:"200994887321",
                  UploadId: uploadId,
                  Body: part,
                  
                  PartNumber: i + 1,
                  
                }),
              )
              .then((d) => {
                console.log("Part", i + 1, "uploaded");
                return d;
              }),
          );
        }
    
        const uploadResults = await Promise.all(uploadPromises);
        await s3Client.send(
          new CompleteMultipartUploadCommand({
            Bucket: bucketName,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: {
              Parts: uploadResults.map(({ ETag }, i) => ({
                ETag,
                PartNumber: i + 1,
              })),
            },
          }));
    
    
    
    
      } catch (err) {
        if (uploadId) {
            const abortCommand = new AbortMultipartUploadCommand({
              Bucket: bucketName,
              Key: key,
              UploadId: uploadId,
            });
            console.log(err);
            await s3Client.send(abortCommand);
          }
         
          return NextResponse.json({ok:false,message:"Internal server error"});
    
        }
        
            return NextResponse.json({ ok:true });
          } catch (error) {
            console.log(error);
            
            return NextResponse.json({ok:false,message:"Internal server error"});
        }
      
       
      } else {
        
          return NextResponse.json({ok:false,message:"Internal server error"});
      }
    
    };
    // export const config = {
    //   api: {
    //     bodyParser: {
    //       sizeLimit: '1024mb', // Adjust the size limit as needed
    //     },
    //   },
    // };
  
  
  