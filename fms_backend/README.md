# FMS Backend

## File Upload Troubleshooting

If you're experiencing issues with file uploads (500 Internal Server Error), try the following steps:

1. Make sure the `fms-uploads` directory exists in the backend folder and has proper permissions:

```bash
mkdir -p fms_backend/fms-uploads
chmod 755 fms_backend/fms-uploads
```

2. Check the database structure by running the provided script:

```bash
cd fms_backend
node scripts/check_uploads_table.js
```

3. Verify your backend logs for specific error messages when uploads fail.

4. Check if the file_uploads table has the correct structure with the following fields:
   - id
   - facility_id
   - file_name
   - original_name
   - file_path
   - file_type
   - file_size
   - file_category
   - description
   - uploaded_by
   - upload_timestamp
   - is_active

5. Make sure the file path is correctly configured in the server.js file - files should be saved to the `fms-uploads` directory and served from `/fms-uploads`.

## Starting the Server

Run the server with:

```bash
node server.js
```

Or with nodemon for development:

```bash
nodemon server.js
```
