import { http, type RequestHandler } from 'msw';
import * as route_36xt6y from '../src/app/api/route';
import * as route_15e5upz from '../src/app/api/%E6%97%A5%E6%9C%AC%E8%AA%9E/route';

export function setupMswHandlers(baseURL: string): RequestHandler[] {
  return [
    http.post(`${baseURL}/api`, ({ request }) => {
      return route_36xt6y.POST(request);
    }),
    http.post(`${baseURL}/api/%E6%97%A5%E6%9C%AC%E8%AA%9E`, ({ request }) => {
      return route_15e5upz.POST(request);
    }),
  ];
}
