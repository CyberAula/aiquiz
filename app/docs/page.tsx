'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function DocsPage() {
  const [spec, setSpec] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we're in development environment
    if (process.env.NODE_ENV !== 'development') {
      setError('Documentation is only available in development environment');
      return;
    }

    // Fetch the OpenAPI spec
    fetch('/api/openapi')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load OpenAPI specification');
        }
        return response.text();
      })
      .then(yamlText => {
        // Import yaml parser dynamically
        import('js-yaml').then(yaml => {
          try {
            const parsedSpec = yaml.load(yamlText);
            setSpec(parsedSpec);
          } catch (parseError) {
            setError('Failed to parse OpenAPI specification');
            console.error('YAML parsing error:', parseError);
          }
        });
      })
      .catch(fetchError => {
        setError('Failed to load OpenAPI specification');
        console.error('Fetch error:', fetchError);
      });
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700">
            API documentation is only available in development environment.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">Loading...</h1>
          <p className="text-gray-500">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AIQuiz API Documentation</h1>
          <p className="text-gray-600">Development Environment Only</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <SwaggerUI 
            spec={spec}
            docExpansion="list"
            defaultModelsExpandDepth={2}
            defaultModelExpandDepth={2}
            displayRequestDuration={true}
            tryItOutEnabled={true}
            filter={true}
            showExtensions={true}
            showCommonExtensions={true}
          />
        </div>
      </div>
    </div>
  );
}