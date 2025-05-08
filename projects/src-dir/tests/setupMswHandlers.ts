import { http, type RequestHandler } from 'msw';
import * as route_og4f3x from '../src/app/[a]/arrayBuffer/route';
import * as route_uq501x from '../src/app/[a]/blob/route';
import * as route_bfn325 from '../src/app/[a]/text/route';
import * as route_36xt6y from '../src/app/api/route';
import * as route_15e5upz from '../src/app/api/%E6%97%A5%E6%9C%AC%E8%AA%9E/route';

export function setupMswHandlers(option?: { baseURL: string }): RequestHandler[] {
  const baseURL = option?.baseURL.replace(/\/$/, '') ?? '';

  return [
    http.get(`${baseURL}/:a/arrayBuffer`, ({ request }) => {
      const pathChunks = request.url.replace(baseURL || /https?:\/\/[^/]+/, '').split('/');
      const params = { 'a': `${pathChunks[1]}` };

      return route_og4f3x.GET(request, { params: Promise.resolve(params) });
    }),
    http.get(`${baseURL}/:a/blob`, ({ request }) => {
      const pathChunks = request.url.replace(baseURL || /https?:\/\/[^/]+/, '').split('/');
      const params = { 'a': `${pathChunks[1]}` };

      return route_uq501x.GET(request, { params: Promise.resolve(params) });
    }),
    http.get(`${baseURL}/:a/text`, ({ request }) => {
      const pathChunks = request.url.replace(baseURL || /https?:\/\/[^/]+/, '').split('/');
      const params = { 'a': `${pathChunks[1]}` };

      return route_bfn325.GET(request, { params: Promise.resolve(params) });
    }),
    http.post(`${baseURL}/api`, ({ request }) => {
      return route_36xt6y.POST(request);
    }),
    http.post(`${baseURL}/api/%E6%97%A5%E6%9C%AC%E8%AA%9E`, ({ request }) => {
      return route_15e5upz.POST(request);
    }),
  ];
}

export function patchFilePrototype(): void {
  File.prototype.arrayBuffer ??= function (): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (): void => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(this);
    });
  };

  File.prototype.bytes ??= function (): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (): void => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = reject;
      reader.readAsArrayBuffer(this);
    });
  };

  File.prototype.stream ??= function (): ReadableStream<Uint8Array> {
    return new ReadableStream({
      start: (controller): void => {
        const reader = new FileReader();

        reader.onload = (): void => {
          const arrayBuffer = reader.result as ArrayBuffer;
          controller.enqueue(new Uint8Array(arrayBuffer));
          controller.close();
        };
        reader.onerror = (): void => {
          controller.error(reader.error);
        };
        reader.readAsArrayBuffer(this);
      },
    });
  };

  File.prototype.text ??= function (): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (): void => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(this);
    });
  };
}
