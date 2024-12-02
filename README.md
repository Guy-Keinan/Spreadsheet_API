## Set Up
- Install dependencies:
    ```bash
    npm install
    ```

## Run App
- **Development Mode:**

    ```bash
    npm run dev
    ```

- **Production Mode:**

    1. Build the application:

        ```bash
        npm run build
        ```

    2. Start the app:

        ```bash
        npm run start
        ```

## Run Tests
- 
    ```bash
    npm run test
    ```

## Assumptions
- Most cells will be actual values
- Most lookup cells won't be too nested 
- The column name (letter) is  a capital letter by default
- Lookup for an empty cell shouldn't be allowed

## Examples
- You can use Postman (or similar) 
- Send a POST request to http://localhost:3000/sheet to create sheet, use this schema:
```json
{
    "columns": [
        {
            "name": "A",
            "type": "string"
        },
        {
            "name": "B",
            "type": "boolean"
        },
        {
            "name": "C",
            "type": "string"
        }
    ]
}
```

- Send a PUT request to set cell to http://localhost:3000/sheet/[sheetId]/cell, you can use this following JSONs:
```json
To set a string cell:
{
    "column": "A",
    "row": 1,
    "value": "hello"
}

To set a boolean cell:
{
    "column": "B",
    "row": 1,
    "value": true
}

To set a lookup cell:
{
    "column": "C",
    "row": 1,
    "value": "lookup(A,1)"
}
```
You can edit existing cells using the same method.

- Send a GET request to fetch your sheet to http://localhost:3000/sheet/[sheetId].
- Send a GET request to fetch all sheets to http://localhost:3000/sheets.