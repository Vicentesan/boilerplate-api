import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import fastify from 'fastify'
import type { FastifyInstance } from 'fastify/types/instance'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { env } from '@/env'

import { errorHandler } from './error-handler'
import { createUserRoute } from './routes/create-user'
import { transformSwaggerSchema } from './transform-schema'

const app: FastifyInstance = buildFastifyInstance()

export function startServer() {
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Boilerplate',
        version: '0.1.0',
      },
      servers: [
        {
          url: env.BASE_URL,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: (schema) => {
      try {
        return transformSwaggerSchema(schema)
      } catch (err) {
        return schema
      }
    },
  })
  app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
  })

  app.setErrorHandler(errorHandler)

  app.register(createUserRoute)

  app
    .listen({
      port: env.PORT,
      host: '0.0.0.0',
    })
    .then(() => {
      console.info(`HTTP server running at ${env.BASE_URL}`)
    })
}

export function buildFastifyInstance() {
  return fastify()
}
