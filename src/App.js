import github from './db.js';
import query from './query.js';
import { useEffect, useState, useCallback } from 'react';
import RepoInfo from './RepoInfo.js';
import SearchBox from './SearchBox.js';
import NavButtons from './NavButtons.js';

function App() {
  let [userName, setUserName] = useState('stranger');
  let [repoList, setRepoList] = useState(null);
  let [pageCount, setPageCount] = useState(2);
  let [queryString, setQueryString] = useState('app');
  let [totalCount, setTotalCount] = useState(null);
  let [startCursor, setStartCursor] = useState(null);
  let [endCursor, setEndCursor] = useState(null);
  let [hasPreviousPage, setHasPreviousPage] = useState(false);
  let [hasNextPage, setHasNextPage] = useState(true);
  let [paginationKeyword, setPaginationKeyword] = useState('first');
  let [paginationString, setPaginationString] = useState('');

  const fetchData = useCallback(() => {
    const { headers, baseURL, username } = github;
    const queryText = JSON.stringify(query(pageCount, queryString, paginationKeyword, paginationString, username));
    fetch(baseURL, {
      method: 'POST',
      headers: headers,
      body: queryText
    })
    .then(response => response.json())
    .then(data => {
      const { viewer: { name }, search: { edges, repositoryCount, pageInfo } } = data.data;
      const { startCursor, endCursor, hasNextPage, hasPreviousPage } = pageInfo || {};
      setStartCursor(startCursor);
      setEndCursor(endCursor);
      setHasPreviousPage(hasPreviousPage);
      setHasNextPage(hasNextPage);
      setUserName(name);
      setRepoList(edges);
      setTotalCount(repositoryCount);
    })
    .catch(error => {
      console.log(error);
    })
  }, [pageCount, queryString, paginationKeyword, paginationString]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className='App container mt-5'>
      <h1 className='text-primary'>
        <i className='bi bi-diagram-2-fill'></i>
        Repos
      </h1>
      <p>Hey there, {userName}</p>
      <SearchBox totalCount={totalCount} queryString={queryString} pageCount={pageCount} onTotalChange={setPageCount} onQueryChange={setQueryString} />
      {
        repoList && (
          <ul className='list-group list-group-flush'>
            {
              repoList.map((repo) => (
                <RepoInfo repo={repo.node} key={repo.node.id.toString()} />
              ))
            }
          </ul>
        )
      }
      <NavButtons
        start={startCursor}
        end={endCursor}
        next={hasNextPage}
        previous={hasPreviousPage}
        onPage={(keyword, pString) => {
          setPaginationKeyword(keyword);
          setPaginationString(pString)
        }}
      />
    </div>
  );
}

export default App;
