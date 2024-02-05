import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameInput,
  FrameReducer,
  getPreviousFrame,
  useFramesReducer,
  validateActionSignature,
} from "frames.js/next/server";
import Link from "next/link";

type State = {
  page: number;
};

const initialState = { page: 1 };

const reducer: FrameReducer<State> = (state, action) => {
  const buttonIndex = action.postBody?.untrustedData.buttonIndex;
  return {
    page:
      state.page === 1 && buttonIndex === 1
        ? 2
        : buttonIndex === 1
          ? state.page - 1
          : buttonIndex === 2
            ? state.page + 1
            : 1,
  };
};

const lastPage = 6;

// This is a react server component only
export default async function Home({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const previousFrame = getPreviousFrame<State>(searchParams);

  const validMessage = await validateActionSignature(previousFrame.postBody);

  const [state, dispatch] = useFramesReducer<State>(
    reducer,
    initialState,
    previousFrame,
  );

  // then, when done, return next frame
  return (
    <div>
      <a href="https://hub.pinata.cloud">hub.pinata.cloud</a> homeframe{" "}
      {process.env.NODE_ENV === "development" ? (
        <Link href="/debug">Debug</Link>
      ) : null}
      <FrameContainer
        postUrl="/frames"
        state={state}
        previousFrame={previousFrame}
      >
        <FrameImage
          src={
            state.page === 1
              ? "https://dweb.mypinata.cloud/ipfs/Qme4aAq77NUxebAK2RbxF1ZJ1hZqqRRCYq5qXjbgGF4wAH/1.png"
              : `https://dweb.mypinata.cloud/ipfs/Qme4aAq77NUxebAK2RbxF1ZJ1hZqqRRCYq5qXjbgGF4wAH/${state.page}.png`
          }
        />
        {state.page !== 1 ? (
          <FrameButton onClick={dispatch}>←</FrameButton>
        ) : null}
        {state.page < lastPage ? (
          <FrameButton onClick={dispatch}>→</FrameButton>
        ) : (
        null
        )}
        <FrameButton href="https://www.pinata.cloud/blog/how-to-make-a-frame-on-farcaster-using-ipfs">Read full post</FrameButton>
        <FrameButton href="https://hub.pinata.cloud">Try our Hub</FrameButton>
      </FrameContainer>
    </div>
  );
}
