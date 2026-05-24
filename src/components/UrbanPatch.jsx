// =========================================
// Urban Patch — Main Application Component
// Features: Anonymous Auth, Community Upvoting, Analytics Dashboard
// =========================================
import { useState, useEffect, useRef } from "react";
import "../styles/style.css";


const SUPA_URL = "https://soacqabfazwdvegnsldv.supabase.co";
const KEY      = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvYWNxYWJmYXp3ZHZlZ25zbGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NzQ5MDAsImV4cCI6MjA5NDQ1MDkwMH0.zqYZlpnOxrwxyLAUqJEoQXAP3Ykt66Ref2LEUjoroqw";
const H        = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const STATUS   = ["OPEN", "RESOLVED", "IGNORED"];
const ADMIN_PIN = "2580"; // Change this to your preferred PIN

// ── Assam map base64 src (truncated for readability, kept same as original)
const ASSAM_MAP_SRC = "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAWXB4ADASIAAhEBAxEB/8QAHQABAAICAwEBAAAAAAAAAAAAAAcIBQYCAwQJAf/EAFUQAQABAwMBBQUFBQUEBQkFCQABAgMEBQYRBwgSITFBEyJRYXEUMoGRoRUjQrHBFjNSYtEkQ3LhF4Ky8PEYNFNjc4OSk5REVFVW0iUmNjdFZISzwv/EABoBAQEAAwEBAAAAAAAAAAAAAAABAgQFBgP/xAA3EQEAAQQBAgMFBwQCAwADAAAAAQIDBBEFITESQVETImFx8BQygZGhsdEVI8HhM0IGUvEWNGL/2gAMAwEAAhEDEQA/ALbAOC3gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAmImOJ8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAmqIjmZiPqANX17qHsrQ71djVNyadjXaI5qt1X470fgjzc/aW6e6V3qcC7larcj0x7c9385GzbxL9z7tEymsVR1jtY5ddFdOk7XpomfuV3rvl9Yhrk9qDqFVPNGm6ZMf8FX+g3aeFy5jfhXRFLo7TvUb/wDC9Nn/AN3V/oT2neo//wCF6bH/ALur/QP6Ll/+q6Io7qvaM6o500xZnFwYj/0VmZ5/PhjZ639W7tFVUaxeimI5macfwiEmYh9qOAyqo3OoX0FENudeeqNWs4tFvV4z5rvU0RYqt8xcmZ47vn+C82k3ci/pmNfy7UWsi5apquUR/DVMeMDSzePuYkRNcxO/R6QFaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADx65qmDomkZWq6lkUY+Ji25uXblU+FMQLETM6h7J8I5lq25+oezNt01/tbX8OzXR524r71X5QrN1q7RmVr9mrRdmU5ODizzF3Kqju3K/lSw/TXoFuvfWm29wapqFOBj5Md63XemarlyPjx58JLuWOJopt+1yq/DHomzW+0z0+wKu7iU6hnzx527XFP5tJ3D2rq6rVdGgbZpi5zxTXk3pqj8qYbDt7stbXxLkV6vquVnfGiinuQ3/Qei3TnR6qa7G37N6umeYqvT355TqymribPaJr+vw/ZXTL7QPVrWLPs9MwbePM+dWNhTVP4TPLX7Nvrlu+9c/f7ivRXPvRXdrt0ePpx4RwvDhaPpWFRFGJpuJZpj0otRD20UUURxRRTTHyjg1JHL49r/isRHz/+KS6T2bOoWq3ab+o14uLNc81VXrk11/X/ALy3zQ+yfjxTE6zuW7VV8Me1EfrPKz4afK5zuVV93VPyj+doo2x2fum+jWqYvaTOpXY87mVXNXP4R4N207Y+ztPtRaw9s6Taoj0jFo/0bCLqHPuZuRdn365n8WMp29oFMcU6Jp0R8saj/R+zt/QZ89F06f8A/Go/0ZIHx9pX6yxv9n9B44/Yunf/AE1H+iIe1TuaNk7Dow9E0/Dx7+qVVWZu02afcp48eI+KcFPe2ZvrB1vXMTa+m3KL1Om1zORcpnmPaTH3fwJdLiLdV/KpircxHWf8fq6expsbE17dGXufUaabtvSu77C3M/72rniZ+kR/34XIQr2Ptt3tE6YftDJpqpu6ne9rTE/4Ijin+qakhOZv+1y6oidxHSP8/qAMnKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFae2L1G0mvblOy9Jz4v5tzIprzItVc00UUxPFMz8Zq4nj5N+7SPUvF2NtC9h4l+J1rNtzRj26Z96iPWqfgrN2d+n09St8XrusV3a9PxaZv5VczPNyqZ8Kefn4/kku/xWHTRT9svdKaesfFvvZ76B6buDQ8Hdu4su7Xau1+0tYlEcRNMT4d6VsMaxaxse3j2LdNu1bpimiimOIpiPKIdOkadh6TptjTtPsU2MaxRFFu3THhEQ9REObnZtzLubqnp5R6ACtIAAAAAAB4td1TC0TSMnVNRv02cXGomu5XVPhEQLETM6hGPaf6iZGxNk02dMqinU9TmqzZr9bVPHvVx848Ij6qabA29qe9d542mYlFzIv3rsV3qvGeKefGqZ/NsnXXqFl9Td703sW1XTgY/NjCs8TNVXM+NXHxniFmOy/0rubI0SrWNWpiNVzqInuceNmj4fVjL19mqni8LxTHvz+s/wCku6Fp9nSdFw9MsREWsWzTapj6Rw9oMnkJmZncgAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADGa/uDRdAxZydY1LGwrURzzeuRTyMopmqdQyYrzvbtR7c0zNnG27pt3V6aJ4qvTPcon6c+b3bN7TmzNVqt2Nbs5Gj3qp471cd63z9YG7/Atc7a2r30y9b/1jLw8e/n2bWPi1Yt+q3VcuXKZppimImfCI5+aK48J978cR6+sR2l52n0r6a7p2/pWbN3Qf2jNq1VdtYmXcszXNMc8c0zM/SGa6O7H21szTrc6LomLg2f8AHbtU0z+MxzL3t0X+Jq6b/wDk6q6fV7G39qP+4b/8N/7F/8AIq7+90/4mH+5v/kX/wAhBvWbS9p6N1p0nSsrI1P2GW8eqq5f1K/Xdq7s8TzVXPHh4cInw614H96/8A4/s3/sX/AMhP/H04uF7MvV+nFvYuPbi9k1xTYu3KKYn2eP8ADEx4+D2dM9l7e3H0v0/Ucr3v21+1cq7uNcvUxzVcj0pmI8oQ/21uovU3S+o+n6Hpuo38LGx8aLtVNm7VRNdyYmJ5iY55iIZvQO0v1E0zTMDDoz9KzLdmzTbqyLuHbmuqKY55mJiZ5+Kx4nF4V2HcuXfH3adYiJ6z31M1bX2tqN2q5m6Xp9+5VPMzdtW6pn8Zph6bOnHRzFv28i1s3T7dy3VFVNdNqOaZifL0T9+yN1h1bqNpuuXdQyMOrKxL8U0Tj27dFM0Vxz4URHnE+S1+Vw2bTV47uPfr6zM/p9Fm/wDt/dM//tXpf/2tv/IVs7W+2dqaP1Z03T9K1TJsYl2zTXdx7VyqmnvVczxERPHxVp99c/0r/8AlX/yJp7Z29N06d1M0zS9H1XLsYmRRbqu2LV2qmiqZqnxmI4mZ9H0u4XFy7F25Xb96mI6/qWl6e6D0V2VtfA1vVdDxL+Vdt03L1y7RzVXVVHEzMz5y07S9D0jT8GjD0vBxcS1RHFFu1biIfP7qP1E3t023Fj4mZqv7RwMu1T7WzfsWq5muuI5maKY555+C/vR/d+q7025Z1fVbH2fJvV3Kbd2bVyiaqfKqJtUxPl4R4S14bA4q7hXb1y54oiYjT083o17QvR3Rdr4en6rqeJZy8fHtxbxbFyJ5t0/KInyiHq2v0e6T61j28bUtu4NzHt0xRRRTTPFMRHlER6QyO5+oG1Nn4uDpuu61i4eRftU3rdV+qKYqpnx55+D0a11S2Nt6xZyNf3TpmLi5NM1W7t29TTVExPlMfNcrj8Oceb2XFiafD4rI6f9D9kbC1m/rGmaZbt3sivvXq6qY71dc+c1z8fLxbv1Z25t3eG0L+ma7gW8zDuRzNuunnx+MT6xPzZrb+99k7nxcjK0PWsTNxcSqbd+7br5oppniY5n5ceD07p3ht7aGk3tW1nOx8XEx6ZquV1xPhERHnM/Bqpw+HfxKrkVz3mOsa6+iEuxz1i1nqHpN/RtfyLmbqGm1U003L1czXTc54iOfrxPh/qsn2iNpbY2300wNX0fSsbFzLWZTFd+1T3a5iaJ8ZifhE/hCqW4es+o713rTvLR7WTp2nXq8nFw5uV0R7ymZomqOInmJ48fH8Vf+1j1b17d+x8TQc/XbGRkY2Vbv37uPci5RTFNM8xPj4/H0X7fD427V4MfmV1zFExr5a19F+jXSzU+nGDqOq6HhZmTl3L1y5ev0d6uZjmqI5mfhHwRz1f7K3T3U995+o6vtmxYw7l2b1u5Zx7tduqnjzpiZ48+fBf7a+69u7j0fH1LRdbxcvGy6Yqs1Wq/e5iePLjx+jW9/wDVPZWw9Iyc7V9fxsXPiiqLMV1d6uquI5imKeZ58vg0YXD4eTbtzN2YmY0/L5+zQjYfSjo9oWv2db03Q8LH1C1VFePcpo/d0T8Zp+Ex+C8vT/btra+z9M0PHm5VZ0+iKrd2Z4mKpjxif1S12c+sOodQ9N1bV1X7+sYd+3as5F6qKq7d2Y5qon08fH6Jp6LdYtmdRtH0zStwYl+1buxRbxq5uW7tqqr4U0T5xPHlPzS5nE4eXiVUWJ1MVTE/KPSH36h6D0417Uq9T1jQ8fKzK6Yt13bkRzVTEeURPzW713R9L3DpV3T9UwcfKwb1Pdu2LtPdprp+Ex8m0U1U10RVRVTVTPlMTxMOWq4d+7Yu0X7Fyi7arjiqiuOaaon4w5qLtyxV7yvK/hU/q32VejGfduZmm4+Xp9+rnm7h3f3c/OqieY/DjwVb62dkfcHTa/RqumXsq/gWaq/a00RzVZuVRzVT+PjH4p7699WtnbH2XdybN65k6rftzbwMW3c71VXd8Ir48opjnnz5+DWOwf061nK1fUeoe4Me7jZVy3Ni1j3p4ri5M811x8Y58PySXLscRRT48S54ZjU/P5oW6P7H2xubpTgaXqulY2RkY+Nai1kVUxN23XHlMVx5xPlHwQ9177OmJpuZ+1tvaHZw9Kx7dFvIxKKYp7lcf9rR6d2fT4p17UfTfQ+o+n3NK1jT7dyKqZt2L9MRFy1PxpmmY8/L5KzdUezJ1B2zVcv4eP8A21o9uJm3kYtPevUR8aqP+z8ePkn27HFTa4u3VbnWp/h5u3s1U0000000UUxTTTHEUxHERD9BXKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPy5V3KKquJniOeIfP/AK7dTNx743Hfxc69XiaZiZFUWcPjiKYjmOav83ry+gKu/al6S6Fkbaz96aXZpw9Qxv3mRTRHu3omfGePSfFHY4a7Zt39XI6zrU+ktl7Je06NvdNLeoVVxXf1WqL1XHpTHhEfzTGpP2a+sOsbb3BgbW1O7GRoeXeps0d7nvWKqp4iI+XPC7ETzETHqQ+fLWLtvJqquf8AbsAK5YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/LldFuia7lVNFMec1TxEP1Wztn73zdOo03aWk5l2xdyaZvZM2qu7M0zPFMcx4+ko2cTGqyrsWqfN3dsnd+38nYlnQcPU8bJzq8umqbdquKppiInnnh6Ow/pFWLsXUtVqqn/bMvimPhFMRDSNidmPUNc07D1nXNbt40ZVEXZt0U9653Z8fGfis/sTaul7N21jaDpFuacaxHnV51VT4zVPzmR1cu9YsYn2W3V4p31Z0BXBAAAAAAAAAAAAAAAAAAAAAAAAAAGh9f8AVtM0jpTrN3Vbc3bN617GmiPOqury/k3xXvts7lwsPZWJtuYqrzcy9Tfppj+GimZjmfzn8kbmBb9pk0U/HyQD2bNuWty9W9IxsiiqqxYuTk3I/wCCJqiPD5xEPoFEcRER6Kt9hTTcSqjX9UrtRVk0Tbt265j7tM88xH5LSDe5y7NeT4P/AFjX+QBXFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABp3Wu5p9rpbr9ep24uY/2SqJpmPOfT9W4oI7aO4KNO6dWNHouzTf1C/HNMT50U+f6o28G1N3Iopj1aF2F8S5VuXX82mmfY0Y0Uc+nM1RMfylbRCfY721Oi9Mp1O7TMXtUve08Y8e5T4R/VNhDY5e9F3LrmPLp+QArmAAAAAAAADjcuW7cc3LlFEf5p4clD+0XvPcusdUNSwftWZYs4d32OPj27k0x4R58R5zPI3sHBqzK5ppnWlne0H1RtbB2n7TTL2Pe1fKq7mPR3oqiiPWqYhTXe/UTe+9rNFjcGs3svHpriqizRbiijn6R5u7A2HvzXtUsY1ekandruTFNNd2iqaaYmfPx8oXc6b9M9tbX2rh6dVpOJeyabcVX7ty1FVVVc+abd2YxuKojceOufr8Ea9i/Zc6XtbK3NnYldvLzq+5Z9pTxMWo9Y+s8rCuNm1bs2qbVm3Tbt0xxTTTHERDkPO5eTVk3ZuVeYArWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFKO1DrV3d/Wq3oGHX7W1h128O3FPjHfmfe/WePwWo6x7rjZnTvVdcpmPb2rM048TPncq8Kf1lVTss7ay949VK9xaj3r1nCqnIvXK/47tUzx/WfySXe4ej2NNeXV2pjUfNcTZulW9E2rpulW6YppxsaijiI9ePH9WWBXDqqmqZmfMAGIAAAAAAAAplve5p2udrLFs3LFMY8ajZtXKZ/jmJjz/Nc1RvdmnZVfaijFs1xTer1e1NFUT5e9Hixl3uCiPHcnep8Mrx0000xEUxERHlw/SPCIGThAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8uVRRbqrq8qYmZFVj7cu45owdH2vZr/va5yb1MesR4Ux+c8/g3rsj7YnQelljOvWu5k6nXORV4cT3fKn9IhVvrhvKvc3VXN1W9Zm9j4t/2NqzM8RNFFXEx/NKdrtU5GJpdrC0/aNq3Nq3FFHNz3aYiOPKJR6e/hX4wqLFune+sraCmWR2m+ol+mYxtMwbfPlNNqauP0Y7E6sdc8+qb+HczLlFU8xFOH4Qbho08DlTG51C7z8uV0W6ZruV00Ux5zVPEKV3dV7Q246Yqp/bdEU/+io9nDH6ntPrzqtmcfPt69ftz/DXcqiP0TcPpTwc/9rtMfiu7Gfgz5ZuN/wDNp/1dd/VdMsW5uXtRxLdEedVV6mIj9VLtF6CdVs617W5VXic/w3sqrn8plkcjs6dRqcC/fy9Wxu5atzXNE35nniDaf0rGpnVWRH1+K2elbs2zqufOBpuvabmZURM+xs5FNVXEefhEsyoX2XaLtrrro9mquYmib1NURPhPFExwvorT5LCjDuxRE73GwBXOcMi9ax7Fd+/cpt2rdM1V11TxFMR5zKH9wdo/pxpWo3MK3kZuoVWqu7XcxrMTRE/WZjlsXaLvX7HRvcFePdqt1+wiOaZ4niaoiVW+zT0q07qNn6hka1fu04WHTETRbniquqefVNuzgYNi5YqyL8z4YnXT6+Kb8jtRbCos1VWcLVrlcR7tM2qI5n695A3THUczenaM0/WbWPcib+pRkVUTPPcoiefGfpCw1XZp6cVUzHsM2OfhemG39OOlW0Nh5F3K0PCqjJuU92b12rvVRHwj4J1ltUZmBi0V/Z4mZmNdW9AMnnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+V0xXRVRVHMVRxL9BUOU9nPp/XruTqmZTnZXt7s3Js1XYiiJmeZ8o5bdh9KOnmLRTRa2pp/FPlNVM1T+st1E1Dbr5DKr73J/Ng8XZ21MWiKMfbul0RHlxjU/6Mvj42Pj24t49i1aojypooimI/J2g1qrldX3p2AKwGA6jV3LexNars972kYdzu8efkz7pzrFGThX8eumKqbluqmYn15hGdurw1RM+Si/ZLt+1626bXX4zRZu1fj3V7lBdpa/R0r65ZWfnYFdVnEyr1iu3T5026pniY/Dhd7Y+6tH3joNrWdEyPbY1zw8fCaZ9YmPiQ7vPUVVXabsR7uo6s4DEbt3Jo+1tGaXjY+T/8QAMxAAAQMCBQMDBAIDAAMBAAAAAQACAwQRBRASITFBEyJRYXEUMoGRoRUjQrHBFjNSYtEk/9oACAEDAQE/AP8A+N658+v+P/8AT/H/AId/94vTf8H+v/8AQ/8Awj9v03/xH9f/APu//2Q==";

// ── Anonymous username generator ──────────────────────────────────────────
const ADJECTIVES = [
  "Brave","Swift","Bold","Keen","Calm","Wise","Bright","Sharp","Clear","Pure",
  "Green","Clean","Active","Civic","Urban","Alert","Quick","Eager","Solid","True",
];
const ANIMALS = [
  "Tiger","Eagle","Heron","Falcon","Panther","Sparrow","Hawk","Crane","Deer","Otter",
  "Wolf","Bear","Fox","Lion","Panda","Rhino","Bison","Lynx","Stag","Raven",
];

function generateAlias() {
  const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const ani  = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num  = Math.floor(1000 + Math.random() * 9000);
  return `${adj}${ani}_${num}`;
}

function getOrCreateUser() {
  try {
    const stored = localStorage.getItem("up_user");
    if (stored) return JSON.parse(stored);
    const user = { id: crypto.randomUUID(), alias: generateAlias(), createdAt: new Date().toISOString() };
    localStorage.setItem("up_user", JSON.stringify(user));
    return user;
  } catch {
    return { id: "anon-" + Date.now(), alias: "AnonymousUser", createdAt: new Date().toISOString() };
  }
}

function getVotedReports() {
  try { return new Set(JSON.parse(localStorage.getItem("up_votes") || "[]")); }
  catch { return new Set(); }
}

function saveVote(reportId) {
  try {
    const votes = getVotedReports();
    votes.add(reportId);
    localStorage.setItem("up_votes", JSON.stringify([...votes]));
  } catch {}
}

// ── Supabase DB layer ────────────────────────────────────────────────────
const db = {
  async getMlas() {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/mla_list?select=*&order=district.asc,constituency.asc`, { headers: H });
      return res.ok ? res.json() : [];
    } catch { return []; }
  },
  async getMla(constituency) {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/mla_list?constituency=eq.${encodeURIComponent(constituency)}&select=*&limit=1`, { headers: H });
      const d = res.ok ? await res.json() : [];
      return d[0] || null;
    } catch { return null; }
  },
  async getMp(seat) {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/mp_list?lok_sabha_seat=eq.${encodeURIComponent(seat)}&select=*&limit=1`, { headers: H });
      const d = res.ok ? await res.json() : [];
      return d[0] || null;
    } catch { return null; }
  },
  async getReports() {
    try {
      const [res1, res2] = await Promise.all([
        fetch(`${SUPA_URL}/rest/v1/public_reports?select=*&order=created_at.desc&limit=200`, { headers: H }),
        fetch(`${SUPA_URL}/rest/v1/reports?select=id,reporter_id,reporter_alias&order=created_at.desc&limit=200`, { headers: H })
      ]);
      const publicRep = res1.ok ? await res1.json() : [];
      const baseRep = res2.ok ? await res2.json() : [];
      
      const baseMap = {};
      baseRep.forEach(r => { baseMap[r.id] = r; });
      
      return publicRep.map(r => ({
        ...r,
        reporter_id: baseMap[r.id] ? baseMap[r.id].reporter_id : null,
        reporter_alias: baseMap[r.id] ? baseMap[r.id].reporter_alias : null
      }));
    } catch { return []; }
  },
  async insertReport(data) {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/reports`, {
        method: "POST",
        headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      return res.ok ? d[0] : null;
    } catch { return null; }
  },
  async updateReportStatus(id, status) {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/reports?id=eq.${id}`, {
        method: "PATCH",
        headers: { ...H, "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch { return false; }
  },
  async updateReportDetails(id, updates) {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/reports?id=eq.${id}`, {
        method: "PATCH",
        headers: { ...H, "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch { return false; }
  },
  async banUser(userId, alias) {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/banned_users`, {
        method: "POST",
        headers: { ...H, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates" },
        body: JSON.stringify({ user_id: userId, alias })
      });
      return res.ok;
    } catch { return false; }
  },
  async getBannedUsers() {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/banned_users?select=*`, { headers: H });
      if (!res.ok) return [];
      const data = await res.json();
      return data.map(u => u.user_id);
    } catch { return []; }
  },
  async upvoteReport(id) {
    try {
      // Use Supabase RPC-style increment via PATCH with raw SQL expression won't work with anon key
      // Instead fetch current count first, then increment
      const res = await fetch(`${SUPA_URL}/rest/v1/reports?id=eq.${id}&select=upvotes`, { headers: H });
      if (!res.ok) return false;
      const rows = await res.json();
      const current = rows[0]?.upvotes || 0;
      const pRes = await fetch(`${SUPA_URL}/rest/v1/reports?id=eq.${id}`, {
        method: "PATCH",
        headers: { ...H, "Content-Type": "application/json" },
        body: JSON.stringify({ upvotes: current + 1 })
      });
      return pRes.ok;
    } catch { return false; }
  },

  async compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob), "image/webp", 0.8);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  },
  async uploadPhoto(file) {
    try {
      const mimeToExt = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "jpg", "image/heif": "jpg" };
      const ext  = mimeToExt[file.type?.toLowerCase()] || (file.name?.includes(".") ? file.name.split(".").pop().toLowerCase() : "jpg");
      const mime = file.type || "image/jpeg";
      const path = `reports/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const res = await fetch(`${SUPA_URL}/storage/v1/object/garbage-photos/${path}`, {
        method: "POST",
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": mime, "cache-control": "3600", "x-upsert": "true" },
        body: file,
      });
      if (!res.ok) { console.error("Photo upload failed:", res.status, await res.text()); return null; }
      return `${SUPA_URL}/storage/v1/object/public/garbage-photos/${path}`;
    } catch (e) { console.error("Photo upload error:", e); return null; }
  },
  async deleteReport(id) {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/reports?id=eq.${id}`, {
        method: "DELETE",
        headers: H
      });
      return res.ok;
    } catch { return false; }
  },
  async getMessages() {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/community_messages?order=created_at.asc&limit=100`, { headers: H });
      return res.ok ? res.json() : [];
    } catch { return []; }
  },
  async deleteMessage(id) {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/community_messages?id=eq.${id}`, {
        method: "DELETE",
        headers: H
      });
      return res.ok;
    } catch { return false; }
  },
  async insertMessage(data) {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/community_messages`, {
        method: "POST",
        headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify(data),
      });
      return res.ok;
    } catch { return false; }
  }
};

// ── Constants ────────────────────────────────────────────────────────────
const WASTE = [
  { id: "mixed",        label: "Mixed Waste",         icon: "\u{1F5D1}\uFE0F", color: "#9CA3AF" },
  { id: "plastic",      label: "Plastic",             icon: "\u{1F9F4}",       color: "#3B82F6" },
  { id: "construction", label: "Construction Debris", icon: "\u{1F9F1}",       color: "#D97706" },
  { id: "organic",      label: "Organic / Food",      icon: "\u{1F342}",       color: "#10B981" },
  { id: "water",        label: "Water Body Dump",     icon: "\u{1F4A7}",       color: "#0EA5E9" },
  { id: "medical",      label: "Medical / Hazardous", icon: "\u26A0\uFE0F",    color: "#8B5CF6" },
];

const PARTY_CLR = {
  BJP: "#FF6B2B", INC: "#1A6CBD", AIUDF: "#059669",
  AGP: "#7C3AED", UPPL: "#D97706", BPF: "#DB2777", "RAIJOR DAL": "#DC2626",
};

// ── Small reusable components ────────────────────────────────────────────
function Badge({ party }) {
  const c = PARTY_CLR[party] || "#9CA3AF";
  return (
    <span style={{ background: c+"22", color: c, border: `1px solid ${c}44`, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: "monospace", whiteSpace: "nowrap" }}>{party}</span>
  );
}

function TimeAgo({ date }) {
  const ms = Date.now() - new Date(date).getTime();
  const h = Math.floor(ms / 3600000), d = Math.floor(h / 24);
  return <span>{d > 0 ? `${d}d` : h > 0 ? `${h}h` : "now"} ago</span>;
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
      <div style={{ width: 28, height: 28, border: "3px solid var(--border-color)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
    </div>
  );
}

function WIcon({ type, size = 16 }) {
  const w = WASTE.find(t => t.id === type) || WASTE[0];
  return <span style={{ fontSize: size }}>{w.icon}</span>;
}

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case "working on it": return "#f59e0b";
    case "resolved":      return "#10b981";
    case "ignored":       return "#ef4444";
    case "open":
    default:              return "#3b82f6";
  }
}

// ── Assam SVG Map ────────────────────────────────────────────────────────

// ── REAL ASSAM MAP — uses the actual Assam district map as background
// with animated SVG red pins for reports
// Function definition
function AssamMap({ reports }) {
  const LON_MIN = 89.55, LON_MAX = 96.25;
  const LAT_MIN = 23.95, LAT_MAX = 28.25;
  const tx = lon => ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 100;
  const ty = lat => ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100;

  const gps   = reports.filter(r => r.lat && r.lng);
  const nogps = reports.filter(r => !r.lat || !r.lng);
  
  const DISTRICT_COORDS = {
    "Kamrup Metropolitan": [91.73, 26.14],
    "Kamrup": [91.33, 26.32],
    "Dibrugarh": [94.91, 27.48],
    "Jorhat": [94.20, 26.75],
    "Nagaon": [92.68, 26.35],
    "Cachar": [92.80, 24.83],
    "Sonitpur": [92.79, 26.63],
    "Tinsukia": [95.35, 27.49],
    "Barpeta": [90.01, 26.32],
    "Bongaigaon": [90.56, 26.47],
    "Darrang": [92.03, 26.43],
    "Dhemaji": [94.55, 27.48],
    "Dhubri": [89.97, 26.02],
    "Goalpara": [90.62, 26.17],
    "Golaghat": [93.97, 26.51],
    "Hailakandi": [92.56, 24.68],
    "Karimganj": [92.35, 24.87],
    "Lakhimpur": [94.10, 27.23],
    "Morigaon": [92.00, 26.25],
    "Nalbari": [91.44, 26.45],
    "Sivasagar": [94.63, 26.98],
    "Karbi Anglong": [93.44, 26.15]
  };

  const CITIES = [
    [91.74,26.18],[94.91,27.48],[93.97,26.75],[92.68,26.35],
    [91.00,26.32],[90.27,26.40],[89.97,26.02],[94.21,26.74],
    [95.37,27.49],[92.80,26.68],[91.44,26.45],[90.55,26.48],
    [93.60,26.55],[92.35,24.87],[92.85,24.85],[94.65,27.00],
  ];

// React state variable
  const [zoom,     setZoom]     = useState(1);
// React state variable
  const [pan,      setPan]      = useState({ x: 0, y: 0 });
// React state variable
  const [dragging, setDragging] = useState(false);
  const dragStart    = useRef(null);
  const lastPan      = useRef({ x: 0, y: 0 });
  const lastDist     = useRef(null);
  const containerRef = useRef(null);

  const MIN_Z = 1, MAX_Z = 5;
  const clamp = z => Math.min(MAX_Z, Math.max(MIN_Z, z));

  // Scroll wheel zoom
  const onWheel = e => {
    e.preventDefault();
    setZoom(z => clamp(z + (e.deltaY < 0 ? 0.15 : -0.15)));
  };

  // Mouse drag to pan
  const onMD = e => { if (zoom <= 1) return; setDragging(true); dragStart.current = { x: e.clientX, y: e.clientY }; lastPan.current = { ...pan }; };
  const onMM = e => {
    if (!dragging || !dragStart.current) return;
    setPan({ x: lastPan.current.x + e.clientX - dragStart.current.x, y: lastPan.current.y + e.clientY - dragStart.current.y });
  };
  const onMU = () => setDragging(false);

  // Touch pinch + drag
  const onTS = e => {
    if (e.touches.length === 2) {
      lastDist.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    } else if (e.touches.length === 1 && zoom > 1) {
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastPan.current = { ...pan };
    }
  };
  const onTM = e => {
    e.preventDefault();
    if (e.touches.length === 2 && lastDist.current) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setZoom(z => clamp(z + (d - lastDist.current) * 0.01));
      lastDist.current = d;
    } else if (e.touches.length === 1 && dragStart.current && zoom > 1) {
      setPan({ x: lastPan.current.x + e.touches[0].clientX - dragStart.current.x, y: lastPan.current.y + e.touches[0].clientY - dragStart.current.y });
    }
  };
  const onTE = () => { lastDist.current = null; dragStart.current = null; };

// React lifecycle hook
  useEffect(() => { if (zoom <= 1) setPan({ x: 0, y: 0 }); }, [zoom]);

// React lifecycle hook
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
// Returning JSX/UI content
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const reset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

// Returning JSX/UI content
  return (
    <div style={{ position: "relative", width: "100%", borderRadius: 12, overflow: "hidden", background: "var(--bg-main)", userSelect: "none" }}>
      {/* +/- zoom buttons */}
      <div style={{ position: "absolute", top: 8, left: 8, zIndex: 10, display: "flex", flexDirection: "column", gap: 4 }}>
        {[{label:"+", fn:()=>setZoom(z=>clamp(z+0.5))}, {label:"−", fn:()=>setZoom(z=>clamp(z-0.5))}].map(b => (
          <button key={b.label} onClick={b.fn} style={{ width:28, height:28, borderRadius:7, border:"1px solid var(--border-color)", background:"var(--bg-surface)", color:"var(--accent-primary)", fontSize:18, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>{b.label}</button>
        ))}
        {zoom > 1 && (
          <button onClick={reset} style={{ width:28, height:28, borderRadius:7, border:"1px solid var(--border-color)", background:"rgba(239, 68, 68, 0.1)", color:"var(--accent-primary)", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }} title="Reset">↺</button>
        )}
      </div>

      {/* Zoom level / report count badge */}
      <div style={{ position:"absolute", top:8, right:8, zIndex:10, background:"var(--accent-primary)ee", color:"#fff", borderRadius:8, padding:"3px 8px", fontSize:10, fontWeight:700 }}>
        {zoom > 1 ? `${zoom.toFixed(1)}×` : reports.length === 0 ? "No reports" : `${reports.length} report${reports.length!==1?"s":""}`}
      </div>

      {/* Hint */}
      <div style={{ position:"absolute", bottom:6, left:"50%", transform:"translateX(-50%)", zIndex:10, fontSize:9, color:"var(--text-secondary)", background:"var(--bg-surface)cc", borderRadius:4, padding:"2px 6px", whiteSpace:"nowrap", pointerEvents:"none" }}>
        {zoom > 1 ? "drag to pan · ↺ to reset" : "scroll or + to zoom · pinch on mobile"}
      </div>

      {/* Zoomable inner */}
      <div
        ref={containerRef}
        onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
        onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
        style={{
          width: "100%", aspectRatio: "1270/920",
          cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
          transform: `scale(${zoom}) translate(${pan.x/zoom}px, ${pan.y/zoom}px)`,
          transformOrigin: "center center",
          transition: dragging ? "none" : "transform 0.12s ease",
          willChange: "transform",
        }}
      >
        <img src={ASSAM_MAP_SRC} alt="Assam map" draggable={false}
          style={{ width:"100%", height:"100%", objectFit:"contain", display:"block", pointerEvents:"none", filter: "sepia(1) hue-rotate(180deg) saturate(0.5) opacity(0.8)" }} />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none"
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", overflow:"visible", pointerEvents:"none" }}>
          <defs>
            <style>{`
              @keyframes pinbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
              @keyframes pinring{0%{r:2;opacity:.8}100%{r:6;opacity:0}}
              .pin-g{animation:pinbob 2s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
              .pin-ring{animation:pinring 1.8s ease-out infinite}
            `}</style>
          </defs>
          {gps.map((r,i) => {
            const w=WASTE.find(t=>t.id===r.waste_type);
            const col=w?.color||"#EF4444";
            
            // Jitter algorithm: spiral distribution based on ID/index so they don't perfectly overlap
            const rJit = (i % 5) * 0.8;
            const aJit = i * 2.4; // Golden angle approx
            const jx = Math.cos(aJit) * rJit;
            const jy = Math.sin(aJit) * rJit;
            
            const cx = tx(r.lng) + jx;
            const cy = ty(r.lat) + jy;

            return (
              <g key={i} className="pin-g" style={{animationDelay:`${i*.25}s`}}>
                <circle cx={cx} cy={cy} r="2" fill="none" stroke={col} strokeWidth="0.4" className="pin-ring" style={{animationDelay:`${i*.25}s`}}/>
                <circle cx={cx} cy={cy-3.5} r="2.2" fill={col} stroke="#fff" strokeWidth="0.5"/>
                <line x1={cx} y1={cy-1.3} x2={cx} y2={cy} stroke={col} strokeWidth="0.8" strokeLinecap="round"/>
                <circle cx={cx} cy={cy-3.5} r="0.8" fill="#fff" opacity="0.8"/>
              </g>
            );
          })}
          {nogps.map((r,i) => {
            const w=WASTE.find(t=>t.id===r.waste_type);
            const col=w?.color||"#EF4444";
            
            // Use district coordinates if available, fallback to CITIES
            const distLoc = DISTRICT_COORDS[r.district];
            const baseLng = distLoc ? distLoc[0] : CITIES[i%CITIES.length][0];
            const baseLat = distLoc ? distLoc[1] : CITIES[i%CITIES.length][1];
            
            // Jitter algorithm: spread out reports from the same district
            const rJit = (i % 6) * 1.0;
            const aJit = i * 2.4; 
            const jx = Math.cos(aJit) * rJit;
            const jy = Math.sin(aJit) * rJit;
            
            const cx = tx(baseLng) + jx;
            const cy = ty(baseLat) + jy;

            return (
              <g key={`n${i}`} className="pin-g" style={{animationDelay:`${i*.35}s`,opacity:0.65}}>
                <circle cx={cx} cy={cy-2.8} r="1.8" fill={col} stroke="#fff" strokeWidth="0.4"/>
                <line x1={cx} y1={cy-1} x2={cx} y2={cy} stroke={col} strokeWidth="0.7" strokeLinecap="round"/>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}



function ReportCard({ r, expanded, onClick, onUpvote, voted }) {
  const w = WASTE.find(t => t.id === r.waste_type) || WASTE[0];
  const isHighPriority = (r.upvotes || 0) >= 10;

  return (
    <div className="report-item stylish-card" onClick={onClick}>
      {r.photo_url ? (
        <img src={r.photo_url} alt="report" className="report-thumb" loading="lazy" />
      ) : (
        <div className="report-icon-thumb" style={{ background: w.color + "15", color: w.color, border: `1px solid ${w.color}30` }}>
          {w.icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{r.constituency}</span>
          <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>• {r.district}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: getStatusColor(r.status) + "20", color: getStatusColor(r.status) }}>
            {(r.status || "OPEN").toUpperCase()}
          </span>
          {isHighPriority && <span className="priority-badge">🔥 HIGH PRIORITY</span>}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}><TimeAgo date={r.created_at} /></span>
        </div>
        {(r.area || r.landmark) && (
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            📍 {[r.area, r.landmark].filter(Boolean).join(" • ")}
          </p>
        )}
        {r.reporter_alias && (
          <div className="reporter-line">
            <span>👤 Reported by</span>
            <span className="reporter-alias">{r.reporter_alias}</span>
          </div>
        )}
        <p className="description-text" style={{
          fontSize: 14, color: "var(--text-primary)", marginBottom: 10, marginTop: 6, lineHeight: 1.5,
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: expanded ? "unset" : 2,
          WebkitBoxOrient: "vertical", wordBreak: "break-word",
        }}>{r.description}</p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-main)", padding: "4px 8px", borderRadius: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>MLA:</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{r.mla_name}</span>
              <Badge party={r.mla_party} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-main)", padding: "4px 8px", borderRadius: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>MP:</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{r.mp_name}</span>
              <Badge party={r.mp_party} />
            </div>
          </div>
          <button
            className={`upvote-btn ${voted ? "voted" : ""}`}
            onClick={e => { e.stopPropagation(); onUpvote && onUpvote(r.id); }}
            title={voted ? "You've already flagged this" : "I see this issue too"}
          >
            <span className="eye">👀</span>
            {voted ? "Flagged" : "I see this too"} · {r.upvotes || 0}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Shame Board ───────────────────────────────────────────────────────────


function ShameBoard({ reports }) {
  const [tab, setTab] = useState("mla");
  const medals = ["🥇", "🥈", "🥉"];
  const shame = count => {
    if (count >= 20) return { label: "⚠️ CRITICAL", bg: "#FEE2E2", color: "#DC2626" };
    if (count >= 10) return { label: "🔴 SERIOUS",  bg: "#FEE2E2", color: "#EF4444" };
    if (count >= 5)  return { label: "🟠 MODERATE", bg: "#FEF3C7", color: "#D97706" };
    return               { label: "🟡 LOW",       bg: "#ECFDF5", color: "#059669" };
  };

  const mlaMap = {};
  reports.forEach(r => {
    const k = `${r.mla_name}||${r.mla_party}||${r.constituency}||${r.district}`;
    if (!mlaMap[k]) mlaMap[k] = { name: r.mla_name, party: r.mla_party, constituency: r.constituency, district: r.district, count: 0, latest: r.created_at };
    mlaMap[k].count++;
    if (new Date(r.created_at) > new Date(mlaMap[k].latest)) mlaMap[k].latest = r.created_at;
  });
  const mpMap = {};
  reports.forEach(r => {
    const k = `${r.mp_name}||${r.mp_party}||${r.lok_sabha_seat}`;
    if (!mpMap[k]) mpMap[k] = { name: r.mp_name, party: r.mp_party, seat: r.lok_sabha_seat, count: 0, areas: new Set(), latest: r.created_at };
    mpMap[k].count++;
    mpMap[k].areas.add(r.constituency);
    if (new Date(r.created_at) > new Date(mpMap[k].latest)) mpMap[k].latest = r.created_at;
  });

  const ranking = tab === "mla"
    ? Object.values(mlaMap).filter(p => p.count >= 1).sort((a, b) => b.count - a.count).slice(0, 10)
    : Object.values(mpMap).filter(p => p.count >= 1).sort((a, b) => b.count - a.count).slice(0, 10)
        .map(p => ({ ...p, areas: p.areas.size }));

  const maxC = ranking[0]?.count || 1;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["mla", "🏛️ MLAs"], ["mp", "🇮🇳 MPs"]].map(([id, label]) => (
          <button key={id} className={`nav-item ${tab === id ? "active" : ""}`} onClick={() => setTab(id)} style={{ flex: 1, justifyContent: "center" }}>{label}</button>
        ))}
      </div>
      {ranking.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-secondary)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <p style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 600 }}>Clean Record</p>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8 }}>No reports yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {ranking.map((p, i) => {
            const lv = shame(p.count);
            return (
              <div key={i} className="report-item" style={{ padding: "16px", alignItems: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: i < 3 ? "var(--accent-primary)" : "var(--bg-main)", color: i < 3 ? "#fff" : "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: i < 3 ? 24 : 16, fontWeight: 800, flexShrink: 0 }}>
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>{p.name}</span>
                    <Badge party={p.party} />
                    <span style={{ background: lv.bg, color: lv.color, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, marginLeft: "auto" }}>{lv.label}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10 }}>
                    {tab === "mla" ? `${p.constituency} • ${p.district}` : `${p.seat} Lok Sabha • ${p.areas} areas`}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 14 }}>
                      {Array.from({ length: Math.min(p.count, 5) }).map((_, j) => <span key={j}>🗑️</span>)}
                      {p.count > 5 && <span style={{ fontSize: 12, color: "var(--accent-primary)", fontWeight: 800, marginLeft: 4 }}>+{p.count - 5}</span>}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 700 }}>{p.count} report{p.count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${(p.count / maxC) * 100}%` }} /></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Admin PIN Modal ───────────────────────────────────────────────────────
function AdminPinModal({ onSuccess, onCancel }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (pin === ADMIN_PIN) { onSuccess(); }
    else { setError(true); setPin(""); setTimeout(() => setError(false), 600); }
  };

  return (
    <div className="pin-overlay">
      <div className="pin-box">
        <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px 0" }}>Admin Access</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>Enter the 4-digit admin PIN to view analytics</p>
        <input
          className={`pin-input ${error ? "error" : ""}`}
          type="password"
          maxLength={4}
          placeholder="••••"
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          autoFocus
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={pin.length < 4}>Enter →</button>
        </div>
      </div>
    </div>
  );
}

// ── Analytics Dashboard ───────────────────────────────────────────────────
function AnalyticsDashboard({ reports }) {
  const total = reports.length || 1;

  // Resolution breakdown
  const statusCounts = { open: 0, "working on it": 0, resolved: 0, ignored: 0 };
  reports.forEach(r => { const s = (r.status || "open").toLowerCase(); if (s in statusCounts) statusCounts[s]++; });
  const resItems = [
    { label: "Open",          count: statusCounts["open"],           color: "#3b82f6" },
    { label: "Working On It", count: statusCounts["working on it"],  color: "#f59e0b" },
    { label: "Resolved",      count: statusCounts["resolved"],        color: "#10b981" },
    { label: "Ignored",       count: statusCounts["ignored"],         color: "#ef4444" },
  ];
  const resolvedPct = Math.round((statusCounts["resolved"] / total) * 100);

  // District heatmap
  const distMap = {};
  reports.forEach(r => { distMap[r.district] = (distMap[r.district] || 0) + 1; });
  const distEntries = Object.entries(distMap).sort((a, b) => b[1] - a[1]);
  const maxDist = distEntries[0]?.[1] || 1;
  const heatColor = (count) => {
    const ratio = count / maxDist;
    if (ratio > 0.75) return { bg: "#fecaca", color: "#991b1b" };
    if (ratio > 0.5)  return { bg: "#fed7aa", color: "#92400e" };
    if (ratio > 0.25) return { bg: "#fef9c3", color: "#713f12" };
    return                   { bg: "#dcfce7", color: "#14532d" };
  };

  // Waste type breakdown
  const wasteMap = {};
  reports.forEach(r => { wasteMap[r.waste_type] = (wasteMap[r.waste_type] || 0) + 1; });
  const wasteEntries = WASTE.map(w => ({ ...w, count: wasteMap[w.id] || 0 })).sort((a, b) => b.count - a.count);
  const maxWaste = wasteEntries[0]?.count || 1;

  // Weekly trend (last 8 weeks)
  const weekBuckets = {};
  reports.forEach(r => {
    const d = new Date(r.created_at);
    const wk = Math.floor((Date.now() - d.getTime()) / (7 * 864e5));
    if (wk < 8) weekBuckets[7 - wk] = (weekBuckets[7 - wk] || 0) + 1;
  });
  const weekData = Array.from({ length: 8 }, (_, i) => weekBuckets[i] || 0);
  const maxWeek = Math.max(1, ...weekData);

  // Top reporters
  const reporterMap = {};
  reports.forEach(r => {
    if (r.reporter_alias) reporterMap[r.reporter_alias] = (reporterMap[r.reporter_alias] || 0) + 1;
  });
  const topReporters = Object.entries(reporterMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Most upvoted
  const topUpvoted = [...reports].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).slice(0, 5);

  return (
    <div className="slide-in">
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>Analytics Dashboard</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>Admin view · {total} total reports</p>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { n: total, l: "Total Reports", s: "All time", icon: "📋" },
          { n: `${resolvedPct}%`, l: "Resolution Rate", s: "Resolved / Total", icon: "✅" },
          { n: statusCounts["open"], l: "Open Issues", s: "Needs attention", icon: "🔴" },
          { n: distEntries.length, l: "Districts Affected", s: "Across Assam", icon: "📍" },
        ].map(s => (
          <div key={s.l} className="card stat-card hoverable">
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value">{s.n}</div>
            <div className="stat-label">{s.l}</div>
            <div className="stat-sub">{s.s}</div>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        {/* Resolution Breakdown */}
        <div className="card hoverable" style={{ gridColumn: "span 1" }}>
          <h3 style={{ fontWeight: 800, fontSize: 16, margin: "0 0 20px 0" }}>📈 Resolution Breakdown</h3>
          <div className="bar-chart">
            {resItems.map(item => (
              <div key={item.label} className="bar-row">
                <div className="bar-label">{item.label}</div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(item.count / total) * 100}%`, background: item.color }}>
                    {item.count > 0 && `${Math.round((item.count / total) * 100)}%`}
                  </div>
                </div>
                <div className="bar-val">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="card hoverable">
          <h3 style={{ fontWeight: 800, fontSize: 16, margin: "0 0 16px 0" }}>📅 Weekly Trend</h3>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 16px 0" }}>Reports submitted per week (last 8 weeks)</p>
          <div className="sparkline">
            {weekData.map((v, i) => (
              <div
                key={i}
                className="spark-bar"
                style={{ height: `${(v / maxWeek) * 100}%` }}
                title={`Week ${i + 1}: ${v} reports`}
              />
            ))}
          </div>
          <div className="spark-label">
            {["8w", "7w", "6w", "5w", "4w", "3w", "2w", "1w"].map(l => <span key={l}>{l}</span>)}
          </div>
        </div>

        {/* Waste Type Breakdown */}
        <div className="card hoverable">
          <h3 style={{ fontWeight: 800, fontSize: 16, margin: "0 0 20px 0" }}>🗂 Waste Types</h3>
          <div className="bar-chart">
            {wasteEntries.map(w => (
              <div key={w.id} className="bar-row">
                <div className="bar-label" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                  <span>{w.icon}</span>
                  <span style={{ fontSize: 10 }}>{w.label.split(" ")[0]}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(w.count / maxWaste) * 100}%`, background: w.color }}>
                    {w.count > 0 && w.count}
                  </div>
                </div>
                <div className="bar-val">{w.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* District Heatmap */}
        <div className="card hoverable" style={{ gridColumn: "1 / -1" }}>
          <h3 style={{ fontWeight: 800, fontSize: 16, margin: "0 0 16px 0" }}>🗺️ District Heatmap</h3>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 16px 0" }}>Color intensity shows number of active reports</p>
          {distEntries.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: 24 }}>No data yet</p>
          ) : (
            <div className="heatmap-grid">
              {distEntries.map(([dist, count]) => {
                const { bg, color } = heatColor(count);
                return (
                  <div key={dist} className="heatmap-cell" style={{ background: bg, color }}>
                    <div style={{ fontSize: 16, marginBottom: 4 }}>📍</div>
                    <div style={{ marginBottom: 2 }}>{dist}</div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{count}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Community Reporters */}
        <div className="card hoverable">
          <h3 style={{ fontWeight: 800, fontSize: 16, margin: "0 0 16px 0" }}>🏆 Top Reporters</h3>
          {topReporters.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>No reporter data yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topReporters.map(([alias, count], i) => (
                <div key={alias} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : "var(--bg-main)", color: i === 0 ? "#fff" : "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                    {i === 0 ? "🏆" : `#${i+1}`}
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "var(--accent-primary)" }}>{alias}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Upvoted Reports */}
        <div className="card hoverable">
          <h3 style={{ fontWeight: 800, fontSize: 16, margin: "0 0 16px 0" }}>👀 Most Flagged Issues</h3>
          {topUpvoted.length === 0 || topUpvoted[0]?.upvotes === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>No upvotes yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topUpvoted.filter(r => (r.upvotes || 0) > 0).map((r, i) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(99,102,241,0.1)", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                    {r.upvotes}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.constituency}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{r.district}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: getStatusColor(r.status) + "20", color: getStatusColor(r.status), fontWeight: 700 }}>{(r.status || "OPEN").toUpperCase()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PIE CHART COMPONENT ──────────────────────────────────────────────────

function PieChart({ reports }) {
  const counts = {};
  reports.forEach(r => { counts[r.waste_type] = (counts[r.waste_type] || 0) + 1; });
  const total = reports.length || 1;
  
  let cum = 0;
  const segments = WASTE.slice(0,6).map(w => {
    const p = ((counts[w.id] || 0) / total);
    const startAngle = cum * 360;
    cum += p;
    const endAngle = cum * 360;
    return { ...w, startAngle, endAngle, pct: p * 100, count: counts[w.id] || 0 };
  }).filter(s => s.count > 0);

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="card hoverable animate-in" style={{ marginBottom: 24, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 32 }}>
      <div style={{ flex: 1, minWidth: 250 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.01em" }}>📊 Waste Type Breakdown</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>Distribution of reported issues across categories.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {segments.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, fontWeight: 600 }}>
              <span style={{ width: 14, height: 14, borderRadius: "4px", background: s.color, display: "inline-block", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
              <span style={{ flex: 1 }}>{s.label}</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 800 }}>{s.count} <span style={{ color: "var(--text-secondary)", fontWeight: 500, fontSize: 12 }}>({Math.round(s.pct)}%)</span></span>
            </div>
          ))}
          {segments.length === 0 && <p style={{ color: "var(--text-secondary)" }}>No data available.</p>}
        </div>
      </div>
      
      {segments.length > 0 && (
        <div style={{ width: 220, height: 220, position: "relative" }}>
          <svg viewBox="-1 -1 2 2" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%", overflow: "visible" }}>
            {segments.map(s => {
              const start = getCoordinatesForPercent(s.startAngle / 360);
              const end = getCoordinatesForPercent(s.endAngle / 360);
              const largeArcFlag = s.pct > 50 ? 1 : 0;
              const pathData = [
                `M ${start[0]} ${start[1]}`,
                `A 1 1 0 ${largeArcFlag} 1 ${end[0]} ${end[1]}`,
                `L 0 0`,
              ].join(' ');
              if (s.pct === 100) return <circle key={s.id} cx="0" cy="0" r="1" fill={s.color} />;
              return (
                <path key={s.id} d={pathData} fill={s.color} className="pie-slice" style={{ transition: "all 0.3s ease", cursor: "pointer", stroke: "#fff", strokeWidth: 0.02 }} />
              );
            })}
          </svg>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 120, height: 120, background: "var(--bg-surface)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)" }}>
            <span style={{ fontSize: 28, fontWeight: 800 }}>{total}</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>Total</span>
          </div>
        </div>
      )}
    </div>
  );
}

const QUOTES = [
  { text: "Cleanliness is not just a choice, it is a civic duty.", author: "Community Initiative" },
  { text: "Every report builds a permanent public record. Silence is no longer an option.", author: "Urban Patch" },
  { text: "Small actions today lead to a sustainable city tomorrow.", author: "Environmental Vision" },
  { text: "Your city. Your voice. We hold them accountable, together.", author: "Urban Patch Motto" },
  { text: "Progress is impossible without change, and those who cannot change their minds cannot change anything.", author: "George Bernard Shaw" },
  { text: "The earth is what we all have in common. Let's protect it.", author: "Wendell Berry" }
];

const HERO_MOTTOS = [
  <>Your city. Your voice. <span style={{ color: "var(--accent-primary)", display: "block" }}>We hold them accountable, together.</span></>,
  <>Spot a dump? Snap a pic. <span style={{ color: "var(--accent-primary)", display: "block" }}>Spark a change.</span></>,
  <>Don't ignore it. Report it. <span style={{ color: "var(--accent-primary)", display: "block" }}>Let's fix our streets.</span></>,
  <>Real change starts with <span style={{ color: "var(--accent-primary)", display: "block" }}>a single tap.</span></>,
  <>A cleaner Assam begins with <span style={{ color: "var(--accent-primary)", display: "block" }}>your accountability.</span></>
];

function HeroTitleCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const int = setInterval(() => setIdx(i => (i + 1) % HERO_MOTTOS.length), 4000);
    return () => clearInterval(int);
  }, []);
  
  return (
    <div className="hero-motto-container">
      {HERO_MOTTOS.map((m, i) => (
        <h1 key={i} className={`hero-title ${i === idx ? 'active' : ''}`} style={{ position: "absolute", inset: 0, opacity: i === idx ? 1 : 0, transition: "all 0.8s ease", transform: i === idx ? "translateY(0)" : "translateY(10px)", pointerEvents: i === idx ? "auto" : "none", margin: 0, width: "100%" }}>
          {m}
        </h1>
      ))}
    </div>
  );
}

function QuoteCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const int = setInterval(() => setIdx(i => (i + 1) % QUOTES.length), 5000);
    return () => clearInterval(int);
  }, []);
  
  return (
    <div className="quote-carousel animate-in">
      <div className="quote-carousel-bg"></div>
      <div className="quote-carousel-content">
        {QUOTES.map((q, i) => (
          <div key={i} className={`quote-slide ${i === idx ? 'active' : ''}`}>
            <p className="quote-text">"{q.text}"</p>
            <p className="quote-author">— {q.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuccessScreen({ onDone }) {
  return (
    <div className="slide-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 72, marginBottom: 24, animation: "pop-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>✅</div>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 12, letterSpacing: "-0.02em" }}>Report Submitted!</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.6, marginBottom: 32, maxWidth: 360 }}>
        Your report has been recorded and published. The MLA &amp; MP for this constituency have been automatically tagged.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button className="btn-primary" onClick={onDone} style={{ padding: "14px 28px", fontSize: 16 }}>
          🏠 Back to Dashboard
        </button>
      </div>
    </div>
  );
}


export default function UrbanPatch() {
  // ── User identity
  const [currentUser]  = useState(() => getOrCreateUser());
  const [votedReports, setVotedReports] = useState(() => getVotedReports());

  // ── Navigation & views
  const [view, setView]           = useState("dashboard");
  const [showPinModal, setShowPinModal]   = useState(false);
  const [isAdmin, setIsAdmin]     = useState(false);

  // ── Data
  const [selReport, setSelReport] = useState(null);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [bannedUsers, setBannedUsers] = useState([]);
  const [reports, setReports]     = useState([]);
  const [loadingRep, setLoadingRep] = useState(true);
  const [districts, setDistricts] = useState([]);
  const [mlas, setMlas]           = useState([]);
  const [loadingMlas, setLoadingMlas] = useState(true);

  // ── Community state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const chatBottomRef = useRef(null);

  // ── Feed sort
  const [feedSort, setFeedSort] = useState("recent"); // "recent" | "upvotes"

  // ── Form state
  const [form, setForm] = useState({ district: "", constituency: "", area: "", landmark: "", waste_type: "mixed", description: "", photoPreview: null, photoFile: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState("");
  const [submitted, setSubmitted]   = useState(false);
  const [preview, setPreview]       = useState(null);
  const [loadingPrev, setLoadingPrev] = useState(false);
  const [position, setPosition]     = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  const fileRef = useRef(null);

  // ── Reverse geocode helper
  const reverseGeocode = async (lat, lng) => {
    try {
      const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 5000);
      const res  = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`, { signal: controller.signal }); clearTimeout(timer);
      const data = await res.json();
      const rawDistrict = (data.principalSubdivision || data.city || "").toLowerCase();
      let matchedDistrict = "";
      if (rawDistrict && districts.length > 0) {
        matchedDistrict = districts.find(d =>
          rawDistrict.includes(d.toLowerCase()) ||
          d.toLowerCase().includes(rawDistrict.replace(" district", "").trim())
        ) || "";
      }
      let matchedConstituency = "";
      const locStrings = [data.locality, data.city, data.principalSubdivision, data.subLocality]
        .filter(Boolean).map(s => s.toLowerCase().replace(" district", "").trim());
      if (mlas && mlas.length > 0) {
        for (const locStr of locStrings) {
          if (!locStr) continue;
          const foundMla = mlas.find(m => {
            const cName = m.constituency.toLowerCase();
            return locStr.includes(cName) || cName.includes(locStr);
          });
          if (foundMla) { matchedConstituency = foundMla.constituency; if (!matchedDistrict) matchedDistrict = foundMla.district; break; }
        }
      }
      setForm(prev => ({ ...prev, district: matchedDistrict || prev.district, constituency: matchedConstituency || prev.constituency, area: data.locality || data.subLocality || prev.area }));
    } catch (e) { console.error(e); }
  };

  const handleGetLocation = e => {
    e.preventDefault();
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      pos => { const { latitude, longitude } = pos.coords; setPosition([latitude, longitude]); reverseGeocode(latitude, longitude); setLoadingLoc(false); },
      err => { console.error(err); alert(`Location failed: ${err.message}`); setLoadingLoc(false); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  // ── Data fetching
  useEffect(() => {
    db.getReports().then(d => { setReports(d || []); setLoadingRep(false); });
    db.getMlas().then(d => { setMlas(d || []); setDistricts([...new Set((d || []).map(m => m.district))].sort()); setLoadingMlas(false); });
    db.getMessages().then(d => setMessages(d || []));
    db.getBannedUsers().then(d => setBannedUsers(d || []));
  }, []);

  // ── Scroll Reveal Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    }, { threshold: 0.1 });
    
    // Slight delay to allow DOM to render before observing
    setTimeout(() => {
      document.querySelectorAll(".animate-in").forEach(el => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, [view]);

  useEffect(() => {
    if (view === "community" && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, view]);

  useEffect(() => {
    if (!form.constituency) { setPreview(null); return; }
    setLoadingPrev(true);
    db.getMla(form.constituency).then(mla => {
      if (!mla) { setPreview(null); setLoadingPrev(false); return; }
      db.getMp(mla.lok_sabha_seat).then(mp => {
        setPreview({ mla: { name: mla.name, party: mla.party, lok_sabha_seat: mla.lok_sabha_seat }, mp: { name: mp?.name, party: mp?.party } });
        setLoadingPrev(false);
      });
    });
  }, [form.constituency]);

  const onPhoto = e => { const f = e.target.files?.[0]; if (!f) return; setForm(prev => ({ ...prev, photoFile: f, photoPreview: URL.createObjectURL(f) })); };

  const onSubmit = async () => {
    if (bannedUsers.includes(currentUser.id)) return alert("You have been banned from submitting reports.");
    if (!form.district || !form.constituency || !form.area || !form.photoFile) return alert("Please fill required fields and add a photo.");
    setSubmitting(true);
    setSubmitStep("uploading");
    const url = await db.uploadPhoto(form.photoFile);
    if (!url) { alert("Error uploading photo. Please try again."); setSubmitting(false); return; }
    setSubmitStep("saving");
    const r = await db.insertReport({
      district: form.district, constituency: form.constituency, area: form.area, landmark: form.landmark,
      waste_type: form.waste_type, description: form.description,
      lok_sabha_seat: mlas.find(m => m.constituency === form.constituency)?.lok_sabha_seat,
      lat: position?.[0] || null, lng: position?.[1] || null,
      photo_url: url,
      reporter_alias: currentUser.alias,
      reporter_id: currentUser.id,
    });
    if (r) {
      setSubmitted(true);
      db.getReports().then(d => setReports(d || []));
      setForm({ district: "", constituency: "", area: "", landmark: "", waste_type: "mixed", description: "", photoPreview: null, photoFile: null });
      setPosition(null);
    } else { alert("Error submitting report"); }
    setSubmitting(false);
  };

  const handleUpvote = async (reportId) => {
    if (votedReports.has(reportId)) return;
    const ok = await db.upvoteReport(reportId);
    if (ok) {
      saveVote(reportId);
      setVotedReports(prev => new Set([...prev, reportId]));
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r));
      if (selReport?.id === reportId) setSelReport(prev => ({ ...prev, upvotes: (prev.upvotes || 0) + 1 }));
    }
  };

  const goToReport = () => { setView("report"); setSubmitted(false); window.scrollTo(0, 0); };

  // ── Computed values
  const activeReports = reports.filter(r => !bannedUsers.includes(r.reporter_id));
  const activeMessages = messages.filter(m => !bannedUsers.includes(m.author_id));

  const uCons  = new Set(activeReports.map(r => r.constituency)).size;
  const total  = activeReports.length;
  const week   = activeReports.filter(r => Date.now() - new Date(r.created_at).getTime() < 7 * 864e5).length;
  const myReports = activeReports.filter(r => r.reporter_id === currentUser.id || r.reporter_alias === currentUser.alias);
  const consForDist = mlas.filter(m => m.district === form.district).sort((a, b) => a.constituency.localeCompare(b.constituency));

  const countByC = {};
  activeReports.forEach(r => { countByC[r.constituency] = countByC[r.constituency] || { count: 0, district: r.district, party: r.mla_party }; countByC[r.constituency].count++; });
  const topC = Object.entries(countByC).sort((a, b) => b[1].count - a[1].count).slice(0, 5);

  const sortedFeed = feedSort === "upvotes"
    ? [...activeReports].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
    : activeReports;

  const NAV = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "report",    icon: "📸", label: "Report" },
    { id: "feed",      icon: "📋", label: "Reports" },
    { id: "mine",      icon: "👤", label: "My Reports" },
    { id: "community", icon: "💬", label: "Community" },
  ];

  return (
    <div className="app-container fade-in">
      {/* Admin PIN Modal */}
      {showPinModal && (
        <AdminPinModal
          onSuccess={() => { setShowPinModal(false); setIsAdmin(true); alert("Admin Mode Unlocked!"); }}
          onCancel={() => setShowPinModal(false)}
        />
      )}

      {/* Top Navbar */}
      <nav className="top-nav">
        <div className="logo">
          <span>Urban Patch</span>
        </div>
        <div className="nav-links">
          {NAV.map(n => (
            <button
              key={n.id}
              id={`nav-${n.id}`}
              className={`nav-item ${view === n.id ? "active " + (n.id === "mine" ? "my-reports-active" : "") : ""}`}
              onClick={() => { setView(n.id); setSubmitted(false); }}
            >
              {n.icon} <span className="hide-mobile">{n.label}</span>
            </button>
          ))}
          <button
            className={`nav-item ${view === "analytics" ? "active" : ""}`}
            onClick={() => { setView("analytics"); setSubmitted(false); }}
            title="Community Analytics"
          >
            📊 <span className="hide-mobile">Analytics</span>
          </button>
          {!isAdmin && (
            <button className="nav-item" onClick={() => setShowPinModal(true)} title="Admin Access">
              🔐
            </button>
          )}
          {isAdmin && (
            <button className="nav-item active" style={{ color: "var(--danger)" }} onClick={() => setIsAdmin(false)} title="Exit Admin">
              🚪
            </button>
          )}
        </div>
        {/* User alias chip */}
        <div className="user-chip" title={`Your anonymous identity: ${currentUser.alias}`}>
          <div className="avatar">{currentUser.alias[0]}</div>
          <span className="alias-text">{currentUser.alias}</span>
        </div>
      </nav>

      {view !== "report" && view !== "analytics" && (
        <button className="fab" onClick={goToReport} aria-label="Report garbage">📸</button>
      )}

      <main className="main-content">

        {/* ── DASHBOARD ── */}
        {view === "dashboard" && (
          <div className="slide-in">
            <div className="hero-section-wrapper">
              <div className="bg-pan"></div>
              <div className="hero-section fade-in-up-stagger" style={{ position: "relative", zIndex: 10 }}>
                <HeroTitleCarousel />
                <p className="hero-subtitle">
                  Spot a garbage dump? Report it in seconds. Every submission automatically tags the responsible MLA & MP, building a permanent, public record of neglect - and of action.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                  <button className="btn-primary" onClick={goToReport}>📸 Report Garbage</button>
                  <button className="btn-secondary" onClick={() => setView("feed")}>Browse Reports ➔</button>
                </div>
              </div>
            </div>

            <div className="stats-grid">
              {[
                { n: total, l: "Total Reports", s: "All time" },
                { n: uCons, l: "Areas Affected", s: "Across state" },
                { n: week,  l: "New This Week", s: "Recent" },
              ].map(s => (
                <div key={s.l} className="card stat-card hoverable animate-in">
                  <div className="stat-value">{loadingRep ? "-" : s.n}</div>
                  <div className="stat-label">{s.l}</div>
                  <div className="stat-sub">{s.s}</div>
                </div>
              ))}
            </div>

            <QuoteCarousel />
            <PieChart reports={reports} />

            <div className="dash-grid animate-in">
              <div className="card hoverable map-container" style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>🗺️ Live Report Map</h2>
                  <span className="badge" style={{ background: "rgba(37,99,235,0.1)", color: "var(--accent-primary)" }}>{total} Reports</span>
                </div>
                <AssamMap reports={reports} />
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
                  {WASTE.map(w => (
                    <span key={w.id} style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: w.color, display: "inline-block" }} />{w.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card hoverable">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>🔥 Hotspots</h2>
                  <span className="badge" style={{ background: "var(--bg-main)", color: "var(--text-secondary)" }}>MOST REPORTED</span>
                </div>
                {!loadingRep && topC.length === 0 ? <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>No reports yet.</p> : null}
                {!loadingRep ? topC.map(([name, data], i) => (
                  <div key={name} style={{ marginBottom: i < topC.length - 1 ? 20 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-secondary)" }}>#{i + 1}</span>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{name}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "var(--accent-primary)" }}>{data.count}</span>
                    </div>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${(data.count / topC[0][1].count) * 100}%` }} /></div>
                  </div>
                )) : null}
              </div>
            </div>

            <div style={{ marginTop: 40, marginBottom: 20 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>Board of Accountability</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 24 }}>Live ranking of politicians based on active garbage reports.</p>
              <ShameBoard reports={reports} />
            </div>

            <div style={{ marginTop: 40 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>Recent Reports</h2>
                <button className="btn-secondary" style={{ padding: "8px 16px" }} onClick={() => setView("feed")}>View All →</button>
              </div>
              <div className="dash-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                {!loadingRep && reports.slice(0, 3).map(r => (
                  <ReportCard key={r.id} r={r} onClick={() => setSelReport(r)} onUpvote={handleUpvote} voted={votedReports.has(r.id)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── REPORT FORM ── */}
        {view === "report" && !submitted && (
          <div className="slide-in" style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Report Garbage</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                Filing as <span style={{ fontWeight: 700, color: "var(--accent-primary)" }}>{currentUser.alias}</span> · Permanent public record.
              </p>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>1. Photo Evidence <span style={{ color: "var(--danger)" }}>*</span></div>
              <div style={{ cursor: "pointer", textAlign: "center", border: form.photoPreview ? "1px solid var(--accent-primary)" : "2px dashed var(--border-color)", borderRadius: 12, background: form.photoPreview ? "transparent" : "var(--bg-main)", display: "flex", alignItems: "center", justifyContent: "center", padding: form.photoPreview ? 0 : 40, overflow: "hidden", transition: "all 0.2s" }} onClick={() => fileRef.current.click()}>
                {form.photoPreview ? (
                  <div style={{ position: "relative", width: "100%" }}>
                    <img src={form.photoPreview} alt="preview" style={{ width: "100%", maxHeight: 300, objectFit: "cover" }} />
                    <div className="badge" style={{ position: "absolute", bottom: 12, right: 12, background: "var(--bg-surface)", color: "var(--accent-primary)", boxShadow: "var(--shadow-md)" }}>Change Photo</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
                    <div style={{ fontWeight: 700, color: "var(--accent-primary)", fontSize: 16, marginBottom: 4 }}>Tap to upload a photo</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Required for verification</div>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPhoto} />
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>2. Location Details <span style={{ color: "var(--danger)" }}>*</span></div>
              <div style={{ marginBottom: 16 }}>
                <button className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: 14, background: "var(--bg-main)", color: "var(--accent-primary)", border: "1px solid var(--accent-primary)", boxShadow: "none" }} onClick={handleGetLocation} disabled={loadingLoc}>
                  {loadingLoc ? "📍 Locating..." : "📍 Use Current Location"}
                </button>
              </div>
              {position && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, marginBottom: 16, fontSize: 13, color: "var(--accent-secondary)", fontWeight: 600 }}><span>📍</span><span>Location captured: {position[0].toFixed(5)}, {position[1].toFixed(5)}</span></div>
              )}
              <div className="form-group">
                <label className="inp-label">DISTRICT</label>
                {loadingMlas ? <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>Loading...</div> :
                  <select className="inp-field" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value, constituency: "", area: "", landmark: "" }))}>
                    <option value="">Select district</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                }
              </div>
              {form.district && (
                <div className="form-group">
                  <label className="inp-label">CONSTITUENCY</label>
                  <select className="inp-field" value={form.constituency} onChange={e => setForm(f => ({ ...f, constituency: e.target.value, area: "", landmark: "" }))}>
                    <option value="">Select constituency</option>
                    {consForDist.map(c => <option key={c.id} value={c.constituency}>{c.constituency}</option>)}
                  </select>
                </div>
              )}
              {form.constituency && (
                <>
                  <div className="form-2col" style={{ marginBottom: 24 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="inp-label">AREA / LOCALITY <span style={{ color: "var(--danger)" }}>*</span></label>
                      <input className="inp-field" placeholder="e.g. MG Road" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="inp-label">LANDMARK (optional)</label>
                      <input className="inp-field" placeholder="e.g. Near SBI ATM" value={form.landmark} onChange={e => setForm(f => ({ ...f, landmark: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ padding: 16, background: "rgba(37,99,235,0.05)", borderRadius: 12, border: "1px solid rgba(37,99,235,0.2)" }}>
                    <div style={{ fontSize: 11, color: "var(--accent-primary)", fontWeight: 700, letterSpacing: ".05em", marginBottom: 12 }}>AUTOMATICALLY TAGGING</div>
                    {loadingPrev ? <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>Looking up...</div> : preview ? (
                      <div className="acc-grid">
                        {[
                          { role: "MLA", name: preview.mla?.name, sub: form.constituency, party: preview.mla?.party },
                          { role: "MP",  name: preview.mp?.name || "—", sub: `${preview.mla?.lok_sabha_seat} Lok Sabha`, party: preview.mp?.party },
                        ].map(p => (
                          <div key={p.role} style={{ padding: 12, background: "var(--bg-surface)", borderRadius: 8, boxShadow: "var(--shadow-sm)" }}>
                            <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, marginBottom: 4 }}>{p.role}</div>
                            <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text-primary)", marginBottom: 2 }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>{p.sub}</div>
                            {p.party && <Badge party={p.party} />}
                          </div>
                        ))}
                      </div>
                    ) : <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>Data not found.</div>}
                  </div>
                </>
              )}
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>3. Additional Info</div>
              <div className="form-group">
                <label className="inp-label">WASTE TYPE</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {WASTE.map(w => (
                    <div key={w.id} className={`type-chip ${form.waste_type === w.id ? "selected" : ""}`} onClick={() => setForm(f => ({ ...f, waste_type: w.id }))}>
                      <span style={{ fontSize: 16 }}>{w.icon}</span> {w.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="inp-label">DESCRIPTION (optional)</label>
                <textarea className="inp-field" placeholder="Describe the severity..." style={{ minHeight: 100 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>

            <div style={{ padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: 10, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>🎭</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Submitting as <span style={{ color: "var(--accent-primary)" }}>{currentUser.alias}</span></div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Your real identity is never stored or shared.</div>
              </div>
            </div>

            <button id="submit-report-btn" className="btn-primary" style={{ width: "100%", padding: "18px", fontSize: 18 }} onClick={onSubmit} disabled={submitting}>
              {submitting && submitStep === "saving" ? "💾 Saving..." : submitting && submitStep === "uploading" ? "📤 Uploading..." : submitting ? "Wait..." : "Submit Report"}
            </button>
          </div>
        )}

        {view === "report" && submitted && <SuccessScreen onDone={() => { setSubmitted(false); setView("dashboard"); }} />}

        {/* ── REPORTS FEED ── */}
        {view === "feed" && (
          <div className="slide-in">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 4px 0" }}>Browse Reports</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: 15, margin: 0 }}>Showing {total} public records.</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className={`nav-item ${feedSort === "recent" ? "active" : ""}`} onClick={() => setFeedSort("recent")} style={{ padding: "8px 14px", fontSize: 13 }}>🕐 Recent</button>
                <button className={`nav-item ${feedSort === "upvotes" ? "active" : ""}`} onClick={() => setFeedSort("upvotes")} style={{ padding: "8px 14px", fontSize: 13 }}>👀 Most Flagged</button>
                <button className="btn-primary" onClick={goToReport} style={{ padding: "8px 16px", fontSize: 14 }}>+ Report</button>
              </div>
            </div>

            <p className="disclaimer-shine" style={{ marginBottom: 24 }}>
              ⚠️ Mappings are sourced from public data and updated per latest election results.
            </p>

            {loadingRep ? <div style={{ textAlign: "center", padding: 40 }}><Spinner /></div> : reports.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
                <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 18 }}>No reports found.</p>
                <button className="btn-primary" style={{ marginTop: 24 }} onClick={goToReport}>Be the first to report</button>
              </div>
            ) : (
              <div className="dash-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
                {sortedFeed.map((r, i) => (
                  <div className="animate-in" key={r.id} style={{ transitionDelay: `${Math.min(i * 0.05, 0.5)}s` }}>
                    <ReportCard r={r} expanded={false} onClick={() => setSelReport(r)} onUpvote={handleUpvote} voted={votedReports.has(r.id)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MY REPORTS ── */}
        {view === "mine" && (
          <div className="slide-in">
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div className="user-chip" style={{ cursor: "default" }}>
                  <div className="avatar">{currentUser.alias[0]}</div>
                  <span>{currentUser.alias}</span>
                </div>
                <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "var(--accent-secondary)" }}>Your Identity</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 4px 0" }}>My Reports</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, margin: 0 }}>
                {myReports.length === 0 ? "You haven't submitted any reports yet." : `${myReports.length} report${myReports.length !== 1 ? "s" : ""} submitted by you.`}
              </p>
            </div>

            {myReports.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
                <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 18 }}>No reports yet</p>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "8px 0 24px" }}>Be a civic hero — report your first garbage dump!</p>
                <button className="btn-primary" onClick={goToReport}>📸 Submit First Report</button>
              </div>
            ) : (
              <div className="dash-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
                {myReports.map(r => <ReportCard key={r.id} r={r} expanded onClick={() => setSelReport(r)} onUpvote={handleUpvote} voted={votedReports.has(r.id)} />)}
              </div>
            )}
          </div>
        )}

        {/* ── COMMUNITY ── */}
        {view === "community" && (
          <div className="slide-in" style={{ maxWidth: 700, margin: "0 auto" }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 4px 0" }}>Community Discussion</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, margin: 0 }}>Discuss major problems anonymously with your city.</p>
            </div>
            
            <div className="chat-window animate-in" style={{ position: "relative", zIndex: 10, backgroundImage: "url(/community_bg.png)", backgroundSize: "cover", backgroundPosition: "center", borderRadius: 20, color: "#1e293b", overflow: "hidden" }}><div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.82)", backdropFilter: "blur(2px)", borderRadius: 20 }} />
              
              <div className="chat-messages" style={{ position: "relative", zIndex: 10, color: "#1e293b" }}>
                {activeMessages.length === 0 ? (
                  <p style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: 40 }}>Be the first to start a discussion!</p>
                ) : (
                  activeMessages.map(msg => {
                    const isMine = msg.author_id === currentUser.id;
                    return (
                      <div key={msg.id} className={`chat-bubble ${isMine ? "mine" : "theirs"}`} style={{ position: "relative" }}>
                          <div className="chat-meta">
                            <span>{isMine ? "You" : msg.author_alias}</span>
                            <span style={{ fontWeight: 500 }}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isAdmin && (
                                <>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if(window.confirm("Delete this message?")) {
                                        const ok = await db.deleteMessage(msg.id);
                                        if (ok) db.getMessages().then(m => setMessages(m || []));
                                      }
                                    }}
                                    style={{ marginLeft: 8, background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 12, padding: 0 }}
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if(window.confirm(`Ban user ${msg.author_alias}?`)) {
                                        const ok = await db.banUser(msg.author_id, msg.author_alias);
                                        if (ok) {
                                          setBannedUsers(prev => [...prev, msg.author_id]);
                                          alert("User banned.");
                                        }
                                      }
                                    }}
                                    style={{ marginLeft: 8, background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 12, padding: 0 }}
                                  >
                                    Ban
                                  </button>
                                </>
                              )}
                            </span>
                          </div>
                          <div>{msg.content}</div>
                        </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>
              
              <div className="chat-input-area" style={{ position: "relative", zIndex: 10, color: "#1e293b" }}>
                <input
                  type="text"
                  className="inp-field"
                  placeholder="Share your thoughts..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && chatInput.trim() && !loadingChat) {
                      if (bannedUsers.includes(currentUser.id)) return alert("You are banned from posting.");
                      setLoadingChat(true);
                      const newMsg = { content: chatInput.trim(), author_alias: currentUser.alias, author_id: currentUser.id };
                      db.insertMessage(newMsg).then(ok => {
                        if (ok) {
                          setChatInput("");
                          db.getMessages().then(d => setMessages(d || []));
                        }
                        setLoadingChat(false);
                      });
                    }
                  }}
                  style={{ flex: 1, marginBottom: 0 }}
                />
                <button
                  className="btn-primary"
                  disabled={loadingChat || !chatInput.trim()}
                  onClick={() => {
                    if (bannedUsers.includes(currentUser.id)) return alert("You are banned from posting.");
                    setLoadingChat(true);
                    const newMsg = { content: chatInput.trim(), author_alias: currentUser.alias, author_id: currentUser.id };
                    db.insertMessage(newMsg).then(ok => {
                      if (ok) {
                        setChatInput("");
                        db.getMessages().then(d => setMessages(d || []));
                      }
                      setLoadingChat(false);
                    });
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {view === "analytics" && (
          <div className="slide-in animate-in">
            <AnalyticsDashboard reports={reports} />
          </div>
        )}

        {/* ── REPORT DETAIL MODAL ── */}
        {selReport && (
          <div className="modal-overlay" onClick={() => setSelReport(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <span className="badge" style={{ background: "var(--bg-main)", color: "var(--text-secondary)" }}>PUBLIC RECORD</span>
                <button onClick={() => setSelReport(null)} style={{ background: "var(--bg-main)", border: "none", color: "var(--text-primary)", cursor: "pointer", width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>✕</button>
              </div>
              {selReport.photo_url && <img src={selReport.photo_url} alt="garbage" style={{ width: "100%", borderRadius: 12, marginBottom: 20, maxHeight: 320, objectFit: "cover", border: "1px solid var(--border-color)" }} />}

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <WIcon type={selReport.waste_type} size={24} />
                  <h2 style={{ fontWeight: 800, fontSize: 24, margin: 0 }}>{selReport.constituency}</h2>
                </div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>
                  {isEditingReport ? (
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <input value={editForm.area} onChange={e => setEditForm(prev => ({...prev, area: e.target.value}))} placeholder="Area" style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-primary)" }} />
                      <input value={editForm.landmark} onChange={e => setEditForm(prev => ({...prev, landmark: e.target.value}))} placeholder="Landmark" style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-primary)" }} />
                    </div>
                  ) : (
                    <>📍 {[selReport.district, selReport.area, selReport.landmark].filter(Boolean).join(" • ")}</>
                  )}
                </div>
                {selReport.reporter_alias && (
                  <div className="reporter-line" style={{ marginTop: 6 }}>
                    <span>👤 Reported by</span>
                    <span className="reporter-alias">{selReport.reporter_alias}</span>
                  </div>
                )}
              </div>

              {(() => { const w = WASTE.find(t => t.id === selReport.waste_type); return w ? <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: w.color + "15", color: w.color, padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 700, marginBottom: 20 }}>{w.icon} {w.label}</div> : null; })()}

              {isEditingReport ? (
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  style={{ width: "100%", padding: 16, background: "var(--bg-main)", borderRadius: 12, border: "1px solid var(--border-color)", color: "var(--text-primary)", fontSize: 15, lineHeight: 1.6, marginBottom: 24, resize: "vertical", minHeight: 100 }}
                  placeholder="Update description..."
                />
              ) : (
                selReport.description && <p style={{ color: "var(--text-primary)", fontSize: 15, lineHeight: 1.6, marginBottom: 24, padding: 16, background: "var(--bg-main)", borderRadius: 12 }}>{selReport.description}</p>
              )}

              <div style={{ padding: 20, background: "rgba(37,99,235,0.05)", borderRadius: 12, border: "1px solid rgba(37,99,235,0.2)" }}>
                <div style={{ fontSize: 11, color: "var(--accent-primary)", fontWeight: 800, letterSpacing: ".05em", marginBottom: 16 }}>TAGGED OFFICIALS</div>
                <div className="acc-grid">
                  {[
                    { role: "MLA", name: selReport.mla_name, sub: selReport.constituency, party: selReport.mla_party },
                    { role: "MP",  name: selReport.mp_name,  sub: selReport.lok_sabha_seat ? `${selReport.lok_sabha_seat} Lok Sabha` : "", party: selReport.mp_party },
                  ].map(p => (
                    <div key={p.role} style={{ background: "var(--bg-surface)", padding: 16, borderRadius: 8, boxShadow: "var(--shadow-sm)" }}>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700, marginBottom: 4 }}>{p.role}</div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text-primary)", marginBottom: 4 }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>{p.sub}</div>
                      {p.party && <Badge party={p.party} />}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12, paddingTop: 16, borderTop: "1px solid var(--border-color)" }}>
                {/* Upvote in modal */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <button
                    className={`upvote-btn ${votedReports.has(selReport.id) ? "voted" : ""}`}
                    onClick={() => handleUpvote(selReport.id)}
                    style={{ fontSize: 14 }}
                  >
                    <span className="eye">👀</span>
                    {votedReports.has(selReport.id) ? "You flagged this" : "I see this too"} · {selReport.upvotes || 0}
                  </button>
                  {(selReport.upvotes || 0) >= 10 && <span className="priority-badge">🔥 HIGH PRIORITY</span>}
                </div>

                {/* Status control */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>Status:</span>
                    {(isAdmin || currentUser.id === selReport.reporter_id) ? (
                      <select
                        value={selReport.status || "open"}
                        onChange={async e => {
                          const newStatus = e.target.value;
                          const ok = await db.updateReportStatus(selReport.id, newStatus);
                          if (ok) { setSelReport({ ...selReport, status: newStatus }); setReports(prev => prev.map(r => r.id === selReport.id ? { ...r, status: newStatus } : r)); }
                          else alert("Failed to update status");
                        }}
                        style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13, fontWeight: 700, color: getStatusColor(selReport.status), background: "var(--bg-surface)", cursor: "pointer" }}
                      >
                        <option value="open">OPEN</option>
                        <option value="working on it">WORKING ON IT</option>
                        <option value="resolved">RESOLVED</option>
                        <option value="ignored">IGNORED</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: getStatusColor(selReport.status) + "20", color: getStatusColor(selReport.status) }}>
                        {(selReport.status || "OPEN").toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Reported <TimeAgo date={selReport.created_at} /></span>
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    <button
                      onClick={() => {
                        if (isEditingReport) {
                          db.updateReportDetails(selReport.id, editForm).then(ok => {
                            if (ok) {
                              const updated = { ...selReport, ...editForm };
                              setSelReport(updated);
                              setReports(prev => prev.map(r => r.id === selReport.id ? updated : r));
                              setIsEditingReport(false);
                            } else alert("Failed to save edits");
                          });
                        } else {
                          setEditForm({ description: selReport.description || "", area: selReport.area || "", landmark: selReport.landmark || "" });
                          setIsEditingReport(true);
                        }
                      }}
                      style={{ background: isEditingReport ? "#10b981" : "var(--bg-main)", color: isEditingReport ? "#fff" : "var(--text-primary)", border: "1px solid var(--border-color)", padding: "8px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", flex: 1 }}
                    >
                      {isEditingReport ? "💾 Save Edits" : "✏️ Edit Report"}
                    </button>
                    {isEditingReport && (
                      <button onClick={() => setIsEditingReport(false)} style={{ background: "var(--bg-main)", color: "var(--text-primary)", border: "1px solid var(--border-color)", padding: "8px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>Cancel</button>
                    )}
                    {!isEditingReport && (
                      <>
                        <button
                          onClick={async () => {
                            if (window.confirm("Are you sure you want to permanently delete this report?")) {
                              const ok = await db.deleteReport(selReport.id);
                              if (ok) {
                                setReports(prev => prev.filter(r => r.id !== selReport.id));
                                setSelReport(null);
                              } else alert("Failed to delete report.");
                            }
                          }}
                          style={{ background: "#fef2f2", color: "var(--danger)", border: "1px solid #fca5a5", padding: "8px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", flex: 1 }}
                        >
                          🗑️ Delete Report
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Ban user ${selReport.reporter_alias}? They will not be able to post again.`)) {
                              const ok = await db.banUser(selReport.reporter_id, selReport.reporter_alias);
                              if (ok) {
                                setBannedUsers(prev => [...prev, selReport.reporter_id]);
                                alert("User banned.");
                              } else alert("Failed to ban user.");
                            }
                          }}
                          style={{ background: "#4b5563", color: "#fff", border: "1px solid #374151", padding: "8px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", flex: 1 }}
                        >
                          🚫 Ban User
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Share */}
                <button
                  onClick={() => {
                    const text = `🗑️ Garbage dump reported in ${selReport.constituency}, ${selReport.district}. MLA ${selReport.mla_name} & MP ${selReport.mp_name} have been tagged. Check it out on Urban Patch.`;
                    if (navigator.share) { navigator.share({ title: "Urban Patch Report", text, url: window.location.href }).catch(e => console.error(e)); }
                    else { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, "_blank"); }
                  }}
                  className="btn-primary"
                  style={{ width: "100%", padding: "10px", fontSize: 14, display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                  Share this Report
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          {NAV.map(n => (
            <button
              key={`bottom-${n.id}`}
              className={`bottom-nav-item ${view === n.id ? "active" : ""}`}
              onClick={() => { setView(n.id); setSubmitted(false); }}
            >
              <span>{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
          <button
            className={`bottom-nav-item ${view === "analytics" ? "active" : ""}`}
            onClick={() => { setView("analytics"); setSubmitted(false); }}
          >
            <span>📈</span>
            <span>Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
}
