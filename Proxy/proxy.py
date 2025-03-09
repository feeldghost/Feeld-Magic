# Libraries
from requests import session
from mitmproxy import http
import websockets
import asyncio
import json

# Variables
appSession = session()
websocketPort = 8765
clients = set()

# Blocked Hosts
blockedHosts = [
    "sdk-tracking.fra-01.braze.eu",
    "sdk.fra-01.braze.eu",
    "flag.lab.eu.amplitude.com",
    "akqdms-launches.appsflyersdk.com",
    "ep2.facebook.com"
]

async def startWebsocket():
    async def handler(websocket):
        clients.add(websocket)

        try:
            async for message in websocket:
                await handleDataFromWebsocket(message, websocket)
        finally:
            clients.remove(websocket)

    return await websockets.serve(handler, "0.0.0.0", websocketPort)

async def sendToClients(data):
    if clients:
        await asyncio.gather(*(client.send(json.dumps(data)) for client in clients))

async def handleDataFromWebsocket(message, websocket):
    try:
        data = json.loads(message)

        if data.get("type") == "like":
            resp = appSession.post("https://core.api.fldcore.com/graphql", headers=data.get("headers"), json={
                "operationName": "ProfileLike",
                "query": "mutation ProfileLike($targetProfileId: String!) {\n  profileLike(input: {targetProfileId: $targetProfileId}) {\n    status\n    chat {\n      ...ChatListItemChatFragment\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment ChatListItemChatFragment on Chat {\n  ...ChatFragment\n  __typename\n}\n\nfragment ChatFragment on Chat {\n  id\n  name\n  type\n  streamChatId\n  status\n  members {\n    ...ChatMemberFragment\n    __typename\n  }\n  disconnectedMembers {\n    ...ChatMemberFragment\n    __typename\n  }\n  __typename\n}\n\nfragment ChatMemberFragment on Profile {\n  id\n  status\n  analyticsId\n  imaginaryName\n  streamUserId\n  age\n  dateOfBirth\n  sexuality\n  isIncognito\n  ...ProfileInteractionStatusFragment\n  gender\n  photos {\n    ...GetPictureUrlFragment\n    pictureType\n    __typename\n  }\n  ...AnalyticsProfileFragment\n  __typename\n}\n\nfragment ProfileInteractionStatusFragment on Profile {\n  interactionStatus {\n    message\n    mine\n    theirs\n    __typename\n  }\n  __typename\n}\n\nfragment GetPictureUrlFragment on Picture {\n  id\n  publicId\n  pictureIsSafe\n  pictureIsPrivate\n  pictureUrl\n  __typename\n}\n\nfragment AnalyticsProfileFragment on Profile {\n  id\n  isUplift\n  lastSeen\n  age\n  gender\n  sexuality\n  verificationStatus\n  distance {\n    km\n    mi\n    __typename\n  }\n  profilePairs {\n    identityId\n    __typename\n  }\n  __typename\n}",
                "variables": {
                    "targetProfileId": data.get("profileId")
                }
            })

            await websocket.send(json.dumps({ "type": "likeResponse", "success": "RECIPROCATED" in resp.text, "displayName": data.get("displayName"), "profileId": data.get("profileId") }))

        if data.get("type") == "dislike":
            resp = appSession.post("https://core.api.fldcore.com/graphql", headers=data.get("headers"), json={
                "operationName": "ProfileDislike",
                "query": "mutation ProfileDislike($targetProfileId: String!) {\n  profileDislike(input: {targetProfileId: $targetProfileId})\n}",
                "variables": {
                    "targetProfileId": data.get("profileId")
                }
            })

            await websocket.send(json.dumps({ "type": "dislikeResponse", "success": "SENT" in resp.text, "displayName": data.get("displayName"), "profileId": data.get("profileId") }))
    except json.JSONDecodeError:
        pass


def request(flow: http.HTTPFlow) -> None:
    if flow.request.pretty_host in blockedHosts:
        flow.kill()

def response(flow: http.HTTPFlow) -> None:
    if flow.request.url == "https://core.api.fldcore.com/graphql":
        responseText = flow.response.get_text()
        requestText = flow.request.get_text()

        if "filteredWhoLikesMe" in responseText:
            asyncio.create_task(sendToClients({ "type": "allLikesResponse", "body": responseText, "headers": dict(flow.request.headers) }))

        if "AuthProviderStatusSyncQuery" in requestText or "AuthProviderQuery" in requestText:
            parsedData = json.loads(responseText)

            parsedData["data"]["account"]["isMajestic"] = True

            flow.response.text = json.dumps(parsedData)

        if "AnalyticsQuery" in requestText:
            parsedData = json.loads(responseText)

            parsedData["data"]["profile"]["isMajestic"] = True

            flow.response.text = json.dumps(parsedData)

async def setup():
    await startWebsocket()

asyncio.create_task(setup())
