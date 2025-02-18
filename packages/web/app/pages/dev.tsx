import { ReactElement } from 'react';
import { GraphiQL } from 'graphiql';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { HiveLogo } from '@/components/v2/icon';
import 'graphiql/graphiql.css';

export default function DevPage(): ReactElement {
  return (
    <div className="mt-20 h-full w-full">
      <style global jsx>{`
        body.graphiql-dark .graphiql-container {
          --color-base: transparent;
          --color-primary: 40, 89%, 60%;
        }
      `}</style>
      {process.browser && (
        <GraphiQL fetcher={createGraphiQLFetcher({ url: `${location.origin}/api/proxy` })}>
          <GraphiQL.Logo>
            <HiveLogo className="h-6 w-6" />
          </GraphiQL.Logo>
        </GraphiQL>
      )}
    </div>
  );
}
