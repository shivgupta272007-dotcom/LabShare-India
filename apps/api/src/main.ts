// ============================================================
// LabShare – API Server Entry Point
// NestJS 10 + OpenAPI 3 + Helmet + Standard Error Serialization
// ============================================================

import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Logger } from '@nestjs/common'
import helmet from 'helmet'
import { AppModule } from './app.module.js'
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js'

async function bootstrap() {
  const logger = new Logger('LabShareAPI')
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Request-Id'],
    },
  })

  // Global Middlewares
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allow Swagger UI
    })
  )

  // API Versioning Prefix
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'ready', 'docs', 'openapi.json'],
  })

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter())

  // OpenAPI 3 Specification & Interactive Swagger UI
  const config = new DocumentBuilder()
    .setTitle('LabShare API')
    .setDescription(
      'Rural School & Community Lab Network Platform API – Connecting idle school labs with under-resourced schools.'
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth & Identity', 'OTP, JWT token rotation, and identity management')
    .addTag('Labs & Discovery', 'Discover labs with Haversine distance, rules, and equipment')
    .addTag('Availability & Rules Engine', 'Free slot computation and bilingual rules engine')
    .addTag('Bookings Workflow', 'State machine transitions and manager actions')
    .addTag('Day-of Operations & Console', 'OTP/QR check-in, checkout, and damage reporting')
    .addTag('Admin & Compliance', 'Immutable hash-chain verification and dispute tribunal')
    .addTag('Impact Analytics & Public Metrics', 'Hero metrics, district heatmaps, and trust scores')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  // Serve raw openapi.json for client code generation
  const httpAdapter = app.getHttpAdapter()
  httpAdapter.get('/openapi.json', (req: any, res: any) => {
    res.json(document)
  })

  const port = process.env.PORT || process.env.API_PORT || 3001
  await app.listen(port, '0.0.0.0')

  logger.log(`🚀 LabShare API running on http://localhost:${port}/api/v1`)
  logger.log(`📚 OpenAPI 3 Documentation available at http://localhost:${port}/docs`)
  logger.log(`🩺 Health check at http://localhost:${port}/health`)
}

bootstrap().catch((err) => {
  console.error('Fatal API bootstrap error:', err)
  process.exit(1)
})
