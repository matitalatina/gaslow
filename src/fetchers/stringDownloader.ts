import axios from "axios";
export class StringDownloader {
  static async download(url: string): Promise<string> {
    return (await axios.get<string>(url)).data;
  }
}