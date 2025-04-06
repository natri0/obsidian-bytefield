# bytefield

a simple Obsidian plugin adding support for byte-field diagrams.

## usage

a byte-field diagram is one of those tables that show offsets of fields in e.g. network packets:

<img width="552" alt="image" src="https://github.com/user-attachments/assets/c7251e69-79e6-43dc-a7a5-889429534457" />

to create one, simply make a codeblock and add your fields.

    ```bytediag
    field1: 3
    field2: 4
    field3: 1
    ```

<img width="552" alt="simple diagram as above" src="https://github.com/user-attachments/assets/dc17abee-1d65-4840-920d-c727d643bb40" />

every line has to contain the name of the field, `: ` as the delimiter and the length of the field in bytes. lines that do not contain `: ` are silently ignored, so feel free to use them as comments.

also, it is possible to change the offset where the diagram starts:

    ```bytediag
    !curOffset: 7
    field1: 5
    field2: 3
    field3: 4
    ```

<img width="564" alt="diagram with starting offset set to 7" src="https://github.com/user-attachments/assets/7427624e-533c-47a3-ba8d-c7f1ece1b5e2" />

fields are wrapped around if they're longer than the row:

<img width="554" alt="diagram with one of the fields wrapping around" src="https://github.com/user-attachments/assets/a5d7132c-f54a-4b8c-9555-bd6aef8b0350" />
