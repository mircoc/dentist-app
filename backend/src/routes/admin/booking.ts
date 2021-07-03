import { FastifyInstance, RouteShorthandOptions } from "fastify"

const opts: RouteShorthandOptions = {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            pong: {
              type: 'string'
            }
          }
        }
      }
    }
  }
  
export default async function(server: FastifyInstance): Promise<void> {
    server.post<{
      // FIXME:
      // Params: GenericGetOneParams;
      // Body: UserUpdateBody;
  }>('/:year/:month/:day', opts, async (request, reply) => {
      return { pong: 'it worked!' }
    });
}