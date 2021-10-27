/* eslint-disable object-shorthand */
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { FetchStub } from './fetch-stub.js';

const generator = new ArcMock();

export const DriveServer = {
  // Size of file array in the query response
  responseSize: 50,
  // Sets value of the `isAppAuthorized` property on the query response
  isAppAuthorized: true,
  // Sets value of the `canDownload` property on the query response
  canDownload: true,
  // Sets value of the `canEdit` property on the query response
  canEdit: true,
  // adds nextPageToken
  addNextPageToken: true,

  createServer: () => {
    DriveServer.srv = new FetchStub();
    DriveServer.srv.install();
    DriveServer.mock();
  },

  mock: () => {
    DriveServer.mockFileDownloadError();
    DriveServer.mockFileDownload();
    DriveServer.mockList();
  },

  mockList: () => {
    const url = /^https:\/\/www\.googleapis\.com\/drive\/v3\/files\?*/;
    DriveServer.srv.respondWith(url, () => {
      const result = DriveServer.generateResponse(DriveServer.responseSize, DriveServer.addNextPageToken);
      return JSON.stringify(result);
    });
  },

  mockFileDownload: () => {
    const url = /^https:\/\/www\.googleapis\.com\/drive\/v3\/files\/[a-z]*\?alt=media/;
    DriveServer.srv.respondWith(url, 'test', {
      headers: {
        'Content-Type': 'application/zip'
      }
    });
  },

  mockFileDownloadError: () => {
    const url = 'https://www.googleapis.com/drive/v3/files/error?alt=media';
    DriveServer.srv.respondWith(url, '{"test": true}', {
      status: 500
    });
  },

  generateResponse: (size, addPageToken) => {
    const files = [];
    for (let i = 0; i < size; i++) {
      files.push(DriveServer.createFileObject());
    }
    const result = {
      files
    };
    if (addPageToken) {
      result.nextPageToken = generator.types.string();
    }
    return result;
  },

  // Creates a dummy Drive file object
  createFileObject: () => {
    const created = generator.time.date();
    const id = generator.types.uuid();
    const obj = {
      id,
      name: generator.lorem.sentence({ words: 2 }),
      createdTime: created.toISOString(),
      isAppAuthorized: DriveServer.isAppAuthorized,
      shared: generator.types.boolean(),
      size: generator.types.number({ min: 0, max: 999999999 }),
      webViewLink: `https://drive.google.com/file/d/${  id  }/view?usp=drivesdk`,
      capabilities: {
        canDownload: DriveServer.canDownload,
        canEdit: DriveServer.canEdit
      }
    };
    return obj;
  },

  restore: () => {
    DriveServer.srv.restore();
  }
};
