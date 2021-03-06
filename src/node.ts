import { parserTableConfig, jsonToMarkdownTable } from './utils';
import {
  readInterfaceAstByName,
  parserTsInterfaceDeclaration
} from './transform';
import { getFieldMetaByLanguage } from './transform/index';
const MT = require('mark-twain');
import * as path from 'path';

interface IPluginConfig {
  lang?: string;
  encodeConfig?: string;
}

export = (
  markdownData: any,
  { lang = 'typescriptInterface', encodeConfig }: IPluginConfig
) => {
  const { content } = markdownData;
  if (Array.isArray(content)) {
    markdownData.content = content
      .map((node: any) => {
        const tagName = node[0];
        const attr = node[1];
        if (tagName === 'pre' && attr && attr.lang === lang) {
          const {
            language,
            filePath,
            interfaceName,
            columnNames,
            exclude
          } = parserTableConfig(node[2][1], encodeConfig);

          let fields = parserTsInterfaceDeclaration(
            readInterfaceAstByName(
              path.resolve(process.cwd(), filePath),
              interfaceName
            )
          );
          if (exclude && exclude.length > 0) {
            fields = fields.filter(o => exclude.indexOf(o.name) === -1);
          }
          return MT(
            jsonToMarkdownTable(
              fields.map(o => getFieldMetaByLanguage(o, language)),
              columnNames
            )
          ).content[1];
        }
        return node;
      })
      .filter(o => !!o);
  }

  return markdownData;
};
