# API Compiler

This project provides a template for defining API endpoints and their specifications.

## Template JSON

Below is an example of the template JSON used to define an API endpoint:

```json
[
    {
        "endpoint": "/api/v1/resource",
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer <token>"
        },
        "body": {
            "key1": "value1",
            "key2": "value2"
        },
        "response": {
            "status": 200,
            "body": {
                "message": "Success",
                "data": {}
            }
        }
    }
]
```

### Fields

- **endpoint**: The URL of the API endpoint.
- **method**: The HTTP method to be used (e.g., GET, POST).
- **headers**: The headers to be included in the API request.
    - **Content-Type**: The media type of the resource.
    - **Authorization**: The bearer token for authorization.
- **body**: The payload to be sent with the request.
    - **key1**: A key-value pair to be included in the request body.
    - **key2**: Another key-value pair to be included in the request body.
- **response**: The expected response from the API.
    - **status**: The HTTP status code of the response.
    - **body**: The body of the response.
        - **message**: A message indicating the result of the request.
        - **data**: Additional data returned by the API.

## Usage

To use this template, replace the placeholder values with your actual API specifications. This template can be used to document and test your API endpoints effectively.
