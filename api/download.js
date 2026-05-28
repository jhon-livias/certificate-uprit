import { handleDownloadRequest } from './dev-download.js';

export default function handler(req, res) {
  handleDownloadRequest(req, res);
}
