import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";
import dotenv from "dotenv";

dotenv.config();

//process env variables
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
const container = process.env.AZURE_STORAGE_CONTAINER_NAME || "";

//connect to storage
const bloblServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
const containerClient = bloblServiceClient.getContainerClient(container);

//upload function, return blob url
export const uploadFile = async (
    file: Buffer,
    regNo: string,
    contentType: string,
    fileExtension:string | undefined,
): Promise<string> => {
    try {
        //create container if not created
        await containerClient.createIfNotExists();

        //create unique blob name
        const sanitizedRegNo = regNo.replace(/[^a-zA-Z0-9-]/g, '-');
        const uniqueName = `${sanitizedRegNo}-${Date.now()}.${fileExtension}`;
        const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);

        //upload the file
        const uploadBlobResponse = await blockBlobClient.upload(
            file,
            file.length,
            {
                blobHTTPHeaders: {
                    blobContentType: contentType,
                },
            }
        );

        //return url
        return blockBlobClient.url;
    } catch (error) {
        console.error('Error uploading file to Azure Blob Storage:', error)
        throw error;
    }
};
