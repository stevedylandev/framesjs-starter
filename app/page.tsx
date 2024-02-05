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
import { generateImage } from "./generate-image";

type State = {
  active: string;
  total_button_presses: number;
};

const initialState = { active: "1", total_button_presses: 0 };

const reducer: FrameReducer<State> = (state, action) => {
  return {
    total_button_presses: state.total_button_presses + 1,
    active: action.postBody?.untrustedData.buttonIndex
      ? String(action.postBody?.untrustedData.buttonIndex)
      : "1",
  };
};

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
    previousFrame
  );

  // Here: do a server side side effect either sync or async (using await), such as minting an NFT if you want.
  // example: load the users credentials & check they have an NFT
  const imageSvg = await generateImage(validMessage!);

  console.log(state);

  // then, when done, return next frame
  return (
    <div>
      Starter kit. <Link href="/debug">Debug</Link>
      <FrameContainer
        postUrl="/frames"
        state={state}
        previousFrame={previousFrame}
      >
        <FrameImage
          src={`https://dweb.mypinata.cloud/ipfs/QmRj4D92h399uJYd7HWbTJk6TRaVa9rR8hUCyCcJaGbLNt/${state.active}`}
        />
        <FrameInput text="put some text here" />
        <FrameButton onClick={dispatch}>
          {state?.active === "1" ? "Active" : "Inactive"}
        </FrameButton>
        <FrameButton onClick={dispatch}>
          {state?.active === "2" ? "Active" : "Inactive"}
        </FrameButton>
        <FrameButton href={`http://localhost:3001/`}>Page link</FrameButton>
        <FrameButton href={`https://www.google.com`}>External</FrameButton>
      </FrameContainer>
    </div>
  );
}
