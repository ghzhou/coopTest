
Windows

  in C:\Windows\system32\drivers\etc\hosts
  add an entry

  127.0.0.1 b.example

  npm install

  npm start

  and visit http://localhost:3000/index.html


  In case you are behind a proxy.

  git -c http.proxy=http://web-proxy... clone <this repository>
 
  npm --proxy http://web-proxy... install

  npm start

