import React, { useEffect } from 'react';
import './App.css';
import {ApolloProvider, ApolloClient, HttpLink, ApolloLink, concat, InMemoryCache, Observable} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import firebaseApp from "./firebase";
import Login from './login';

const App = (props) => {

  useEffect(() => {
    firebaseApp.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        const idTokenResult = await user.getIdTokenResult();
        const hasuraClaim = idTokenResult.claims["https://hasura.io/jwt/claims"];
        if (hasuraClaim) {
          localStorage.setItem("token", token);
        } else {
          // Check if refresh is required.
          const metadataRef = firebaseApp.database().ref("metadata/" + user.uid + "/refreshTime");
          metadataRef.on("value", async (data) => {
            if (!data.exists) return;
            // Force refresh to pick up the latest custom claims changes.
            const token = await user.getIdToken(true);
            localStorage.setItem("token", token);
          });
        }
      } else {
        localStorage.clear();
      }
    });
  }, []);

  const errorLink = onError(
    ({ graphQLErrors, operation, forward }) => {
      if (graphQLErrors) {
        console.error("graphQLErrors", graphQLErrors);
        for (let err of graphQLErrors) {
          switch (err.extensions.code) {
            case "access-denied":
              if (firebaseApp.auth().currentUser) {
                firebaseApp.auth().signOut()
                .then(res => console.log("Logged out user."))
                .catch(err => console.log("Logout Error => ", err))
              }
              localStorage.clear();
              window.location.href = "/";
              break;
            case "invalid-jwt":
              if (!firebaseApp.auth().currentUser) {
                localStorage.clear();
                window.location.href = "/";
              }
              return new Observable((observer) => {
                firebaseApp
                  .auth()
                  .currentUser.getIdToken(true)
                  .then((token_) => {
                    localStorage.setItem("token", token_);
                    let oldHeaders = operation.getContext().headers;
                    operation.setContext({
                      headers: {
                        ...oldHeaders,
                        Authorization: `Bearer ${token_}`,
                      },
                    });
                    const subscriber = {
                      next: observer.next.bind(observer),
                      error: observer.error.bind(observer),
                      complete: observer.complete.bind(observer),
                    };
                    // Retry last failed request
                    return forward(operation).subscribe(subscriber);
                  })
                  .catch((error) => {
                    // No refresh or client token available, we force user to login
                    observer.error(error);
                  });
              });
            default:
            // console.log("default error handler");
          }
        }
      }
    }
  );
  
  const httpLink = new HttpLink({ uri: "https://48p1r2roz4.sse.codesandbox.io" });
  
  const authMiddleware = new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return forward(operation);
  })
  
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: errorLink.concat(concat(authMiddleware, httpLink)),
  });

  return (
    <ApolloProvider client={client}>
      <Login/>
    </ApolloProvider>
  );
}

export default App;
