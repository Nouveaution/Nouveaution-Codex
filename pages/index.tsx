import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { remark } from 'remark';
import html from 'remark-html';
import React, { Ref } from 'react';
import HTMLFlipBook from 'react-pageflip';
import styled from 'styled-components'

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

async function getMarkdownData(filepath: string): Promise<string> {
  const fileContents = await readFile(filepath, 'utf8');
  const result = await remark().use(html).process(fileContents);
  return result.toString();
}

async function getFilePaths(dirPath: string): Promise<string[]> {
  let entries = await readdir(dirPath, { withFileTypes: true });
  let filePaths = entries
    .filter((entry) => !entry.isDirectory())
    .map((entry) => path.join(dirPath, entry.name));
  let dirPaths = entries.filter((entry) => entry.isDirectory());
  for (const dir of dirPaths) {
    filePaths = filePaths.concat(await getFilePaths(path.join(dirPath, dir.name)));
  }
  return filePaths;
}

interface PageProps {
  content: string;
  number: number;
}

const Page = React.forwardRef<HTMLDivElement, PageProps>((props, ref) => (
  <S.Page className="demoPage" ref={ref}>
    {/* <S.Header>Page Header</S.Header> */}
    <S.PageContent dangerouslySetInnerHTML={{ __html: props.content }} />
    <S.Text>{props.number}</S.Text>
  </S.Page>
));

interface MyBookProps {
  pages: string[];
}

const MyBook: React.FC<MyBookProps> = ({ pages }) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <S.Desk>
      {/* @ts-ignore */}
      <S.Book
        width={550} 
        height={730}
        showCover
        onFlip={(e) => {
          console.log(e)
        }}
      >
        <S.Cover>
          <S.CoverInner>
            <S.Title>
              The Codex
            </S.Title>
            <S.Subtitle>
              Your Guide to
            </S.Subtitle>
            <S.Subtitle>
              the Nouveaution Manor
            </S.Subtitle>
          </S.CoverInner>
        </S.Cover>
        <Page content={''} number={1}/>
        {pages.map((content, i) => (
          <Page key={i} number={i + 2} content={content} />
        ))}
      </S.Book>
    </S.Desk>
   
  );

}

export async function getServerSideProps() {
  const filePaths = await getFilePaths('./codex');
  const pages = await Promise.all(filePaths.map(getMarkdownData));
  return {
    props: {
      pages,
    },
  };
}

export default MyBook;

const S = {
  Desk: styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  Book: styled(HTMLFlipBook)`
    width: 300px;
    height: 500px;
    margin: 0 auto;
    
  `,
  Page: styled.div`
    width: 100%;
    height: 100%;
    line-height: 1.5;
    font-size: 20px;
    padding: 40px;
    box-sizing: border-box;
    background: white;
    border-radius: 6px;
    overflow: auto;
    box-shadow: 0 0 20px rgba(0,0,0,0.8);
    background: #fffef0;
    box-shadow: 2px 3px 20px black, 0 0 125px #8f5922 inset;
    background-image: url(data:image/png;base64,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);
    * {
      font-size: 16px;
      font-family: 'DellaRespira';
    }

    h1 {
      font-size: 30px;
      font-family: 'Legrand';
      line-height: 1.15;
      margin-bottom: 10px;
    }

    h2 {
      font-size: 24px;
      font-family: 'Legrand';
      margin-bottom: 5px;
    }

    h3 {
      font-size: 16px;
      margin-bottom: 5px;
      /* font-family: 'Legrand'; */
    }

    p, ul, ol {
      margin-bottom: 10px;
    }

    a {
      text-decoration: none;
      color: #333;
    }
  `,
  PageContent: styled.div`
    margin: 0 auto;
    max-width: 800px;
    text-align: justify;
  `,
  Header: styled.h1`
    font-size: 20px;
    color: #333;
    margin-bottom: 10px;
  `,
  Text: styled.p`
    font-size: 1em;
    color: #666;
  `,
  Cover: styled.div`
    width: 100%;
    height: 100%;
    line-height: 1.5;
    font-size: 20px;

    background-color: #f8f8f8;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    font-family: 'Legrand';
    border-radius: 6px;
    background-image: url('/cover.jpg');
    background-size: cover;
    overflow: hidden;
    background-position: center;
    background-size: 104.75%;
    box-shadow: 0 0 20px rgba(0,0,0,0.8);


  `,

  CoverInner: styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    background-image: url(data:image/png;base64,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);
    box-shadow: 2px 3px 20px black, 0 0 125px #8f5922 inset;
  
  `,

  Title: styled.h1`
      font-family: 'Legrand';
      font-size: 60px;

  `,

  Subtitle: styled.div`
      font-family: 'DellaRespira';
    
  `
};