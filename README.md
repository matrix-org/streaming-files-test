# Streaming Files Test

A basic standalone test jig of [MSC4016](https://github.com/matrix-org/matrix-spec-proposals/pull/4016) encrypted
file streaming for Matrix.

![msc4016-screenie](https://github.com/matrix-org/streaming-files-test/assets/1294269/2b6f09eb-67be-4715-8860-363557c2a8e5)

Requires the [matthew/streaming](https://github.com/matrix-org/matrix-encrypt-attachment/pull/26) branch of matrix-encrypt-attachment.

To run:

```bash
npm i
npm run dev
```

...and select a file from disk, which the test jig will load, stream through `encryptStreamAttachment()` and
`decryptStreamAttachment()` and render the result showing the associated `EncryptedFile` block.
