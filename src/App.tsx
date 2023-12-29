import './App.css'

import { encryptStreamedAttachment } from 'matrix-encrypt-attachment'

async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        const fileStream = await fileToReadableStream(file);
        const queuingStrategy = new CountQueuingStrategy({ highWaterMark: 1 });

        const writableStream = new WritableStream(
            {
                write(chunk) {
                    console.log("Got chunk ", chunk);
                },
                close() {
                    console.log("WritableSteam closed");
                },
                abort(err) {
                    console.log("Sink error:", err);
                }
            },
            queuingStrategy,
        );

        const info = await encryptStreamedAttachment(fileStream, writableStream);
        console.log("Encrypting with info: ", info);
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
                console.log("enqueing chunk", chunk);
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
                console.error('Error reading file:', error);
                controller.error(error);
            };

            function readNextChunk() {
                const slice = file.slice(offset, offset + chunkSize);
                console.log("readNextChunk", slice);
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
                <input id="file" type="file" onChange={ onFile }/>
            </form>
        </>
    )
}

export default App
