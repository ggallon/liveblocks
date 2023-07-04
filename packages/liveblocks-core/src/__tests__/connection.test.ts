import { ManagedSocket } from "../connection";
import {
  AUTH_FAIL,
  AUTH_SUCCESS,
  defineBehavior,
  SOCKET_AUTOCONNECT,
  SOCKET_NO_BEHAVIOR,
} from "./_behaviors";

describe("ManagedSocket", () => {
  test("failure to authenticate", async () => {
    jest.useFakeTimers();

    const { delegates } = defineBehavior(AUTH_FAIL, SOCKET_NO_BEHAVIOR);

    const didConnect = jest.fn();
    // const didDisconnect = jest.fn();

    const mgr = new ManagedSocket(delegates);
    mgr.events.didConnect.subscribe(didConnect);
    // mgr.events.didDisconnect.subscribe(didDisconnect);

    mgr.connect();
    await jest.advanceTimersByTimeAsync(4000);
    mgr.disconnect();

    expect(didConnect).not.toBeCalled();
    // expect(didDisconnect).not.toBeCalled(); // Never connected, so never disconnected either
  });

  test("authenticate succeeds, but no websocket connection", async () => {
    jest.useFakeTimers();

    const { delegates } = defineBehavior(AUTH_SUCCESS, SOCKET_AUTOCONNECT);

    const didConnect = jest.fn();
    // const didDisconnect = jest.fn();

    const mgr = new ManagedSocket(delegates);
    mgr.events.didConnect.subscribe(didConnect);
    // mgr.events.didDisconnect.subscribe(didDisconnect);

    mgr.connect();
    await jest.advanceTimersByTimeAsync(4000);
    mgr.disconnect();

    expect(didConnect).toBeCalledTimes(1);
    // expect(didDisconnect).toBeCalledTimes(1);
  });
});
