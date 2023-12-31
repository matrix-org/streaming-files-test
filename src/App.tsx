import './App.css'

import { encryptStreamedAttachment, decryptStreamedAttachment } from 'matrix-encrypt-attachment'


async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        console.log("encrypting file", file);
        const fileStream = await fileToReadableStream(file);
        const identityTransform = new TransformStream();

        const info = await encryptStreamedAttachment(fileStream, identityTransform.writable);
        console.log("Encrypting with info: ", info);

/*
        const response = await fetch(`https://localhost:8088/matthewtest-${new Date().getTime()}`, {
            method: 'PUT',
            body: identityTransform.readable,
            duplex: 'half',
            headers: {
                'Content-Type': file.type,
            },
        });
        console.log(response);
*/

        const queuingStrategy = new CountQueuingStrategy({ highWaterMark: 1 });

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
                    console.log("WritableSteam: closed");
                },
                abort(err) {
                    console.log("WritableStream: Sink error:", err);
                }
            },
            queuingStrategy,
        );

        await decryptStreamedAttachment(identityTransform.readable, writableStream, info);
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