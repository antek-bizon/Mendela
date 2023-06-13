import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import * as xml2js from 'xml2js'

@Injectable({
  providedIn: 'root'
})
export class MagazineService {
  constructor (private readonly httpClient: HttpClient) {}

  async fetchData (): Promise<Magazine[]> {
    return await new Promise((resolve, reject) => {
      try {
        this.httpClient.get('./assets/czasopisma.xml', { responseType: 'text' })
          .subscribe((xml) => {
            new xml2js.Parser({ mergeAttrs: true, explicitArray: false }).parseStringPromise(xml)
              .then((json) => {
                const entries = Object.entries(json.czasopisma) as any
                const result: Magazine[] = []
                console.log(json)
                for (const [key, value] of entries) {
                  if (key === 'zmienne' || key === 'lata') continue
                  const parsedIssues: Issue[] = []
                  for (const issueValue of Object.values(value) as any) {
                    if (typeof issueValue.nazwa === 'undefined') continue

                    parsedIssues.push({
                      rok: issueValue.rok,
                      nazwa: issueValue.nazwa,
                      numer: issueValue.numer,
                      wydawca: issueValue.wydawca,
                      format: issueValue.format,
                      stron: issueValue.stron,
                      miniaturka: issueValue.miniaturka,
                      plik: issueValue.plik,
                      skan: issueValue.skan,
                      przetworzenie: issueValue.przetworzenie,
                      podeslal: issueValue.podeslal
                    })
                  }

                  const years = json.czasopisma.lata[key].split(',')

                  const magazine: Magazine = {
                    name: key as string,
                    issues: parsedIssues,
                    years,
                    icon: this.getIcon(json, key)
                  }
                  result.push(magazine)
                }
                resolve(result.sort((a, b) => a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())))
              })
              .catch((e) => {
                reject(e)
              })
          })
      } catch (e) {
        reject(e)
      }
    })
  }

  getIcon (json: any, magazine: string): string {
    for (const [key, value] of Object.entries<any>(json.czasopisma.zmienne)) {
      if (magazine === key) {
        return value.src as string
      }
    }
    return ''
  }
}

export interface Magazine {
  name: string
  issues: Issue[]
  years: string[]
  icon: string
}

export interface Issue {
  rok: string
  format: string
  miniaturka: string
  nazwa: string
  numer: string
  plik: string
  podeslal: string
  przetworzenie: string
  skan: string
  wydawca: string
  stron: string
}
