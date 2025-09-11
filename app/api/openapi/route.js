import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  // Only allow access in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'API documentation is only available in development environment' },
      { status: 403 }
    );
  }

  try {
    // Read the OpenAPI YAML file
    const filePath = join(process.cwd(), 'openapi.yaml');
    const yamlContent = readFileSync(filePath, 'utf8');
    
    return new NextResponse(yamlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-yaml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error reading OpenAPI specification:', error);
    return NextResponse.json(
      { error: 'Failed to load OpenAPI specification' },
      { status: 500 }
    );
  }
}