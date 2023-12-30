import './App.css'

import { encryptStreamedAttachment, decryptStreamedAttachment } from 'matrix-encrypt-attachment'

async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        console.log("encrypting file with length", file.size);
        const fileStream = await fileToReadableStream(file);
        const queuingStrategy = new CountQueuingStrategy({ highWaterMark: 1 });
        const identityStream = new TransformStream();
        const info = await encryptStreamedAttachment(fileStream, identityStream.writable);
        console.log("Encrypting with info: ", info);

        // incrementally reassemble the image into a blob via a data URL
        let imageBlob = new Blob();
        const writableStream = new WritableStream(
            {
                write(chunk) {
                    console.log("WritableStream: Got chunk ", chunk);
                    imageBlob = new Blob([imageBlob, chunk]);
                    const imageUrl = URL.createObjectURL(imageBlob);
                    document.getElementById('outputImage').src = imageUrl;
                },
                close() {
                    console.log(imageBlob);
                    console.log("WritableSteam: closed");
                },
                abort(err) {
                    console.log("WritableStream: Sink error:", err);
                }
            },
            queuingStrategy,
        );

        await decryptStreamedAttachment(identityStream.readable, writableStream, info);
    }
}

async function fileToReadableStream(file: File) {
    return new ReadableStream({
        async start(controller) {
            const chunkSize = 32768; // Adjust the chunk size as needed
            let offset = 0;

            const reader = new FileReader();

            reader.onload = function () {
                const chunk = new Uint8Array(reader.result as ArrayBufferLike);
                console.log("ReadableStream: enqueuing chunk", chunk);
                if (chunk.length > 0) {
                    controller.enqueue(chunk);
                    offset += chunk.length;
                }

                if (offset < file.size) {
                    readNextChunk();
                } else {
                    controller.close();
                }
            };

            reader.onerror = function (error) {
                console.error('ReadableStream: Error reading file:', error);
                controller.error(error);
            };

            function readNextChunk() {
                const slice = file.slice(offset, offset + chunkSize);
                console.log("ReadableStream: readNextChunk", slice);
                reader.readAsArrayBuffer(slice);
            }

            readNextChunk();
        }
    });
}

function App() {
    return (
        <>
            <form>
                <label htmlFor="file">Pick an image:</label><br/>
                <input id="file" type="file" onChange={ onFile } accept="image/png, image/jpeg, image/gif"/>
            </form>
            <br/>
            <img id="outputImage"/>
        </>
    )
}

export default App