import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { AppModule } from './app.module.js'

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false })

  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'ready', 'docs', 'openapi.json'],
  })

  const config = new DocumentBuilder()
    .setTitle('LabShare API')
    .setDescription('Rural School & Community Lab Network API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  const outputPath = resolve(process.cwd(), 'openapi.json')
  writeFileSync(outputPath, JSON.stringify(document, null, 2))
  console.log(`✓ Generated OpenAPI spec at ${outputPath}`)
  await app.close()
  process.exit(0)
}

generate().catch((err) => {
  console.error('Failed to generate OpenAPI spec:', err)
  process.exit(1)
})
