import express from 'express';
import fs from 'fs';
import path from 'path';
import portfinder from 'portfinder';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const validateHeaders = (headers: Record<string, string>): boolean => {
    if (typeof headers !== 'object' || headers === null) {
        return false;
    }
    for (const key in headers) {
        if (typeof headers[key] !== 'string') {
            return false;
        }
    }
    return true;
};

const validateBody = (body: Record<string, any>): boolean => {
    return typeof body === 'object' && body !== null;
};

const validateRoute = (route: Route): boolean => {
    const requiredFields = ['endpoint', 'method', 'response'];
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    for (const field of requiredFields) {
        if (!route.hasOwnProperty(field)) {
            return false;
        }
    }

    if (!validMethods.includes(route.method.toUpperCase())) {
        return false;
    }

    if (!route.response.hasOwnProperty('status') || !route.response.hasOwnProperty('body')) {
        return false;
    }

    if (route.headers && !validateHeaders(route.headers)) {
        return false;
    }

    if (route.body && !validateBody(route.body)) {
        return false;
    }

    return true;
};
const app = express();

app.use(express.json());

app.get('/json/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'json', req.params.filename);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).send('File not found');
        }
        res.json(JSON.parse(data));
    });
});

portfinder.getPortPromise()
    .then((port) => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error('No available ports found', err);
    });

interface Route {
    endpoint: string;
    method: string;
    headers?: Record<string, string>;
    body?: Record<string, any>;
    response: {
        status: number;
        body: any;
    };
}

const createRoutesFromJson = (): void => {
    const jsonDir = path.join(__dirname, 'json');
    const configPath = path.join(__dirname, 'config.json');
    let apiKeys: string[] = [];

    try {
        const configData = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configData);
        apiKeys = config.ApiKeys || [];
    } catch (e) {
        console.error('Unable to read or parse config.json:', e);
    }

    const validateToken = (token: string): boolean => {
        return apiKeys.includes(token);
    };

    app.use((req, res, next) => {
        const token = req.headers['authorization'];
        if (token && validateToken(token)) {
            next();
        } else {
            res.status(401).send('Unauthorized');
        }
    });
    fs.readdir(jsonDir, (err, files) => {
        if (err) {
            return console.error('Unable to scan directory:', err);
        }
        files.forEach((file) => {
            const filePath = path.join(jsonDir, file);
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    return console.error('Unable to read file:', err);
                }
                let routes: Route[];
                try {
                    routes = JSON.parse(data);
                } catch (e) {
                    return console.error('Invalid JSON format in file:', file);
                }

                routes.forEach((route) => {
                    if (validateRoute(route)) {
                        app[route.method.toLowerCase()](route.endpoint, (req, res) => {
                            res.status(route.response.status).json(route.response.body);
                        });
                    } else {
                        console.error('Invalid route format in file:', file);
                    }
                });
            });
        });
    });
};

createRoutesFromJson();