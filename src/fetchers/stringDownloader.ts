import axios from "axios";
import { injectable } from "inversify";

@injectable()
export class StringDownloader {
  async download(url: string): Promise<string> {
    return (await axios.get<string>(url, { transformResponse: (r) => r })).data;
  }
}
