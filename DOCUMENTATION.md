#### withDefaults([optns]) 

Merge provided options with defaults.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | provided options | *Optional* |




##### Examples

```javascript

const optns = { port: 6379, host: '127.0.0.1', url: process.env.REDIS_URL };
const options = withDefaults(optns);

// => { url: ...}
```


##### Returns


- `Object`  merged options



#### createClient(optns) 

Create redis client or return existing one




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | valid options | &nbsp; |
| optns.recreate&#x3D;false | `Boolean`  | whether to create new client | *Optional* |
| optns.prefix&#x3D;&#x27;r&#x27; | `String`  | client key prefix | *Optional* |




##### Examples

```javascript

const client = createClient();

const client = createClient({ recreate: true });
```


##### Returns


- `Object`  redis client



#### createPubSub(optns) 

Create redis pubsub clients




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | valid options | &nbsp; |
| optns.recreate&#x3D;false | `Boolean`  | whether to create new clients | *Optional* |
| optns.prefix&#x3D;&#x27;r&#x27; | `String`  | client key prefix | *Optional* |




##### Examples

```javascript

const { publisher, subscriber } = createPubSub();

const { publisher, subscriber } = createPubSub({ recreate: true });
```


##### Returns


- `Object`  redis pubsub clients



#### createClients(optns) 

Create redis clients




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | valid options | &nbsp; |




##### Examples

```javascript

const { client, publisher, subscriber } = createClients();

const { client, publisher, subscriber } = createClients({ new: true });
```


##### Returns


- `Object`  redis clients



#### createMulti() 

Create redis multi command object






##### Examples

```javascript

const multi = createMulti();
multi.set('abc:1', 1).set('abc:2', 2).set('abc:3', 3).exec(done);
```


##### Returns


- `Object`  redis clients



#### keyFor(args) 

Generate data storage key




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| args | `String` `String`  | valid key parts | &nbsp; |




##### Examples

```javascript

keyFor('users');
// => 'r:users';

keyFor('users', 'likes');
// => 'r:users:likes'
```


##### Returns


- `Void`



#### set(key, value[, expiry, time, strategy], done) 

Set key to hold the value. If key already holds a value, it is overwritten, regardless of its type.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| key | `String`  | key | &nbsp; |
| value | `Mixed`  | value | &nbsp; |
| expiry | `String`  | expiry strategy(i.e PX or EX) | *Optional* |
| time | `Number`  | expiry time(i.e seconds or milliseconds) | *Optional* |
| strategy | `String`  | save strategy(i.e NX or XX) | *Optional* |
| done | `Function`  | callback to invoke on success or failure | &nbsp; |




##### Examples

```javascript

set('users:count', 1);
set('users:count', 1, 'EX', 2);
set('users:count', 1, 'PX', 2000);
set('users:count', 1, 'EX', 1, 'NX');
set('users:count', 1, (error, value, key) => { ... });
```


##### Returns


- `Void`



#### get(key, done) 

Get the value of key. If the key does not exist, null is returned.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| key | `String`  | key | &nbsp; |
| done | `Function`  | callback to invoke on success or failure | &nbsp; |




##### Examples

```javascript

get('users:count');
get('users:count', (error, value) => { ... });
```


##### Returns


- `Void`



#### keys(pattern, done) 

Find all keys matching given pattern




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| pattern | `String`  | valid key pattern | &nbsp; |
| done | `Function`  | callback to invoke on success or failure | &nbsp; |




##### Examples

```javascript

keys('users', (error, keys) => { ... });
```


##### Returns


- `Void`



#### clear(done) 

Clear all data saved and their key




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| done | `Function`  | callback to invoke on success or failure | &nbsp; |




##### Examples

```javascript

clear(error => { ... });

clear('users', error => { ... });
```


##### Returns


- `Void`



#### info(done) 

Collect information and statistics about the server




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| done | `Function`  | callback to invoke on success or failure | &nbsp; |




##### Examples

```javascript

info((error, info) => { ... });
```


##### Returns


- `Void`



#### count(args, done) 

Count the number of keys that match specified pattern




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| args | `String` `String`  | valid key patterns | &nbsp; |
| done | `Function`  | callback to invoke on success or failure | &nbsp; |




##### Examples

```javascript

count('users', (error, counts) => { ... });
count('users:sessions*', 'users:visits*', (error, counts) => { ... });
```


##### Returns


- `Void`



#### quit() 

Quit and restore redis clients states






##### Examples

```javascript

quit();
```


##### Returns


- `Void`




*Documentation generated with [doxdox](https://github.com/neogeek/doxdox).*
