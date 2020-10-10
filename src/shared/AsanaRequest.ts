import 'es6-promise';
import 'isomorphic-fetch';
import buildUrl from 'build-url';

interface RequestOptionsWithBody {
  queryParams?: { [indexSignature: string]: string | string[] };
  contentType?: string;
  specialHeaders?: object,
  body?: object
}

type GetRequestOptions = Omit<RequestOptionsWithBody, 'body'>;

export default class AsanaRequest {
  private apiUrlBase = 'https://app.asana.com/api/1.0/';

  constructor(private decryptedAccessToken: string) {
    this.decryptedAccessToken = decryptedAccessToken;
  }

  public async post(urlPath: string, options: RequestOptionsWithBody): Promise<any> {
    const fullEndpointUrl = this.buildEndpointUrl(urlPath, options.queryParams);

    const postBody = JSON.stringify(Object(options.body));

    try {
      const response = await this.shapedFetch('post', fullEndpointUrl, options);
      const jsonData = await response.json();
      return jsonData;
    } catch (error) {
      throw new Error(error);
    }
  }

  public async get(
    urlPath: string, options?: GetRequestOptions,
  ): Promise<any> {
    const fullEndpointUrl = this.buildEndpointUrl(urlPath, options?.queryParams);

    try {
      const response = await this.shapedFetch('get', fullEndpointUrl, options);
      const jsonData = await response.json();
      return jsonData;
    } catch (error) {
      throw new Error(error);
    }
  }

  // ----------------- internal methods

  private buildEndpointUrl
  <QueryParamsShape extends { [idx: string]: string | string[] }>(
    urlPath: string, queryParams?: QueryParamsShape,
  ) {
    return buildUrl(this.apiUrlBase, { path: urlPath, queryParams });
  }

  private async shapedFetch(
    method: 'get' | 'post',
    fullEndpointUrl: string,
    options?: GetRequestOptions | RequestOptionsWithBody,
  ) {
    const requestOptions: any = {
      method,
      mode: 'cors' as 'cors',
      headers: {
        authorization: `Bearer ${this.decryptedAccessToken}`,
        'content-type': options && options.contentType ? options.contentType : 'application/json',
        ...Object(options ? options.specialHeaders : null),
      },
    };

    if (method === 'post') {
      requestOptions.body = JSON.stringify((options as RequestOptionsWithBody).body);
    }

    return fetch(fullEndpointUrl, requestOptions);
  }
}
