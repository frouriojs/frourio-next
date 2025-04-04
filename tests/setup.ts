import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

File.prototype.stream ??= function (): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start: (controller) => {
      const reader = new FileReader();

      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        controller.enqueue(new Uint8Array(arrayBuffer));
        controller.close();
      };

      reader.onerror = () => {
        controller.error(reader.error);
      };

      reader.readAsArrayBuffer(this);
    },
  });
};
