#### withDefaults([optns]) 

Merge provided options with defaults.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | provided options | *Optional* |
| optns.url&#x3D;&#x27;redis://127.0.0.1:6379&#x27; | `String`  | valid redis url | *Optional* |
| optns.db&#x3D;0 | `String`  | valid redis database number | *Optional* |
| optns.prefix&#x3D;&#x27;r&#x27; | `String`  | valid redis key prefix | *Optional* |
| optns.separator&#x3D;&#x27;:&#x27; | `String`  | valid redis key separator | *Optional* |
| optns.eventPrefix&#x3D;&#x27;events&#x27; | `String`  | valid redis events key prefix | *Optional* |
| optns.lockTtl&#x3D;1000 | `Number`  | valid redis ttl in milliseconds | *Optional* |




##### Examples

```javascript

const optns = { url: process.env.REDIS_URL, prefix: 'r', ... };
const options = withDefaults(optns);

// => { url: ...}
```


##### Returns


- `Object`  merged options



#### createRedisClient(optns) 

Create redis client




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | valid options | &nbsp; |
| optns.url&#x3D;&#x27;redis://127.0.0.1:6379&#x27; | `String`  | valid redis url | *Optional* |
| optns.prefix&#x3D;&#x27;r&#x27; | `String`  | client key prefix | *Optional* |




##### Examples

```javascript

const client = createRedisClient();
```


##### Returns


- `Object`  redis client



#### quitRedisClient(redisClient) 

Quit given redis client




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| redisClient | `Object`  | Valid redis client instance | &nbsp; |




##### Examples

```javascript

quitRedisClient(client);
```


##### Returns


- `Void`



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



#### eventKeyFor(args) 

Generate event key




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| args | `String` `String`  | valid key parts | &nbsp; |




##### Examples

```javascript

eventKeyFor('users:pay');
// => 'r:events:users:pay';

eventKeyFor('users', 'pay');
// => 'r:events:users:pay'
```


##### Returns


- `Void`



#### lockKeyFor(args) 

Generate lock key




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| args | `String` `String`  | valid key parts | &nbsp; |




##### Examples

```javascript

lockKeyFor('users:pay');
// => 'r:locks:users:pay';

lockKeyFor('users', 'pay');
// => 'r:locks:users:pay'
```


##### Returns


- `Void`



#### createClient(optns) 

Create redis client or return existing one




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | valid options | &nbsp; |
| optns.url&#x3D;&#x27;redis://127.0.0.1:6379&#x27; | `String`  | valid redis url | *Optional* |
| optns.recreate&#x3D;false | `Boolean`  | whether to create new client | *Optional* |
| optns.prefix&#x3D;&#x27;r&#x27; | `String`  | client key prefix | *Optional* |




##### Examples

```javascript

const client = createClient();

const client = createClient({ recreate: true });
```


##### Returns


- `Object`  redis client



#### createCli(optns) 

Create redis cli client or return existing one




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | valid options | &nbsp; |
| optns.url&#x3D;&#x27;redis://127.0.0.1:6379&#x27; | `String`  | valid redis url | *Optional* |
| optns.recreate&#x3D;false | `Boolean`  | whether to create new client | *Optional* |
| optns.prefix&#x3D;&#x27;r&#x27; | `String`  | client key prefix | *Optional* |




##### Examples

```javascript

const cli = createCli();

const cli = createCli({ recreate: true });
```


##### Returns


- `Object`  redis client



#### createLocker(optns) 

Create redis lock client




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | valid options | &nbsp; |
| optns.url&#x3D;&#x27;redis://127.0.0.1:6379&#x27; | `String`  | valid redis url | *Optional* |
| optns.recreate&#x3D;false | `Boolean`  | whether to create new client | *Optional* |
| optns.prefix&#x3D;&#x27;r&#x27; | `String`  | client key prefix | *Optional* |




##### Examples

```javascript

const locker = createLocker();

const locker = createLocker({ recreate: true });
```


##### Returns


- `Object`  redis lock client



#### createWarlock(optns) 

Create redis warlock instance




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | valid options | &nbsp; |
| optns.url&#x3D;&#x27;redis://127.0.0.1:6379&#x27; | `String`  | valid redis url | *Optional* |
| optns.recreate&#x3D;false | `Boolean`  | whether to create new client | *Optional* |
| optns.prefix&#x3D;&#x27;r&#x27; | `String`  | client key prefix | *Optional* |




##### Examples

```javascript

const warlocker = createWarlock();

const warlocker = createWarlock({ recreate: true });
```


##### Returns


- `Object`  redis warlock instance



#### createPublisher(optns) 

Create redis publisher client




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | valid options | &nbsp; |
| optns.url&#x3D;&#x27;redis://127.0.0.1:6379&#x27; | `String`  | valid redis url | *Optional* |
| optns.recreate&#x3D;false | `Boolean`  | whether to create new client | *Optional* |
| optns.prefix&#x3D;&#x27;r&#x27; | `String`  | client key prefix | *Optional* |




##### Examples

```javascript

const publisher = createPublisher();

const publisher = createPublisher({ recreate: true });
```


##### Returns


- `Object`  redis publisher client



#### createSubscriber(optns) 

Create redis subscriber client




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | valid options | &nbsp; |
| optns.url&#x3D;&#x27;redis://127.0.0.1:6379&#x27; | `String`  | valid redis url | *Optional* |
| optns.recreate&#x3D;false | `Boolean`  | whether to create new client | *Optional* |
| optns.prefix&#x3D;&#x27;r&#x27; | `String`  | client key prefix | *Optional* |




##### Examples

```javascript

const subscriber = createSubscriber();

const subscriber = createSubscriber({ recreate: true });
```


##### Returns


- `Object`  redis subscriber client



#### createPubSub(optns) 

Create redis pubsub clients




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | valid options | &nbsp; |
| optns.url&#x3D;&#x27;redis://127.0.0.1:6379&#x27; | `String`  | valid redis url | *Optional* |
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
| optns.url&#x3D;&#x27;redis://127.0.0.1:6379&#x27; | `String`  | valid redis url | *Optional* |
| optns.recreate&#x3D;false | `Boolean`  | whether to create new client | *Optional* |
| optns.prefix&#x3D;&#x27;r&#x27; | `String`  | client key prefix | *Optional* |




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



#### config(params, done) 

Read or reconfigure redis server at run time




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| params |  | Valid config params | &nbsp; |
| done | `Function`  | callback to invoke on success or failure | &nbsp; |




##### Examples

```javascript

config('SET', 'notify-keyspace-events', 'Ex');
config('SET', 'notify-keyspace-events', 'Ex', (error, results) => { ... });

config('GET', 'notify-keyspace-events');
config('GET', 'notify-keyspace-events', (error, results) => { ... });
```


##### Returns


- `Void`



#### setConfig(params, done) 

Reconfigure redis server at run time




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| params |  | Valid config params | &nbsp; |
| done | `Function`  | callback to invoke on success or failure | &nbsp; |




##### Examples

```javascript

config('notify-keyspace-events', 'Ex');
config('notify-keyspace-events', 'Ex', (error, results) => { ... });
```


##### Returns


- `Void`



#### getConfig(params, done) 

Read redis server at run time




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| params |  | Valid config params | &nbsp; |
| done | `Function`  | callback to invoke on success or failure | &nbsp; |




##### Examples

```javascript

config('notify-keyspace-events');
config('notify-keyspace-events', (error, results) => { ... });
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



#### quit() 

Quit and restore redis clients states






##### Examples

```javascript

quit();
```


##### Returns


- `Void`



#### emit(channel, message[, done]) 

Posts a message to the given channel




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| channel | `String`  | valid channel name or patterns | &nbsp; |
| message | `Mixed`  | valid message to emit | &nbsp; |
| done | `Function`  | callback to invoke on success or failure | *Optional* |




##### Examples

```javascript

emit('user:clicks', { time: Date.now() });
```


##### Returns


- `Void`



#### publish(channel, message[, done]) 

Posts a message to the given channel




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| channel | `String`  | valid channel name or patterns | &nbsp; |
| message | `Mixed`  | valid message to publish | &nbsp; |
| done | `Function`  | callback to invoke on success or failure | *Optional* |




##### Examples

```javascript

publish('user:clicks', { time: Date.now() });
```


##### Returns


- `Void`



#### on(channel, done) 

Listen for messages published to channels matching the given patterns




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| channel | `String`  | valid channel name or patterns | &nbsp; |
| done | `Function`  | callback to invoke on message | &nbsp; |




##### Examples

```javascript

on('user:clicks', (channel, message) => { ... });
```


##### Returns


- `Void`



#### subscribe(channel, done) 

Listen for messages published to channels matching the given patterns




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| channel | `String`  | valid channel name or patterns | &nbsp; |
| done | `Function`  | callback to invoke on message | &nbsp; |




##### Examples

```javascript

subscribe('user:clicks', (channel, message) => { ... });
```


##### Returns


- `Void`



#### unsubscribe(channel, done) 

Stop listen for messages published to channels matching the given patterns




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| channel | `String`  | valid channel name or patterns | &nbsp; |
| done | `Function`  | callback to invoke on message | &nbsp; |




##### Examples

```javascript

unsubscribe('user:clicks', (channel, count) => { ... });
```


##### Returns


- `Void`



#### lock(key, ttl[, done]) 

Set lock




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| key | `String`  | name for the lock key | &nbsp; |
| ttl | `Number`  | time in milliseconds for the lock to live | &nbsp; |
| done | `Function`  | callback to invoke on success or failure | *Optional* |




##### Examples

```javascript

lock('paymments:pay', 1000, (error, unlock) => { ... });

lock('scheduler:work', (error, unlock) => { ... });
```


##### Returns


- `Void`




*Documentation generated with [doxdox](https://github.com/neogeek/doxdox).*
