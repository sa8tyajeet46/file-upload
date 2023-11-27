"use client"
import {
    AbortMultipartUploadCommand,
    CompleteMultipartUploadCommand,
    CreateMultipartUploadCommand,
    S3Client,
    UploadPartCommand
  } from "@aws-sdk/client-s3"
  import https from "https";
  import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
  import { PutObjectCommand } from "@aws-sdk/client-s3";
  import {
    getSignedUrl,
    S3RequestPresigner,
  } from "@aws-sdk/s3-request-presigner";
  async function put(url:any, data:any) {

    await fetch(
        url,
        { method: "PUT", body:data  });
  }
const createPresignedUrlWithClient = async ( bucket:any, key :any) => {
    try{
    const client = new S3Client({
      region: "ap-south-1",
      
      credentials: fromCognitoIdentityPool({
        clientConfig: { region: "eu-north-1" },
        identityPoolId: "eu-north-1:6882a53f-ea7c-49cb-b0b6-bea5052ec264",
        
      })
    });
   const file: File | null = key.get('file') as unknown as File;
    const command = new PutObjectCommand({ Bucket: bucket, Key: file.name });
    const clientUrl= await getSignedUrl(client, command, { expiresIn: 60 });
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
   
     await put(clientUrl, buffer);
    return clientUrl;
}
catch(e){
    console.log(e);
    throw new Error();
}
  };
  export default createPresignedUrlWithClient;