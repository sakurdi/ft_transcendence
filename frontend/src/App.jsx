import React, { useEffect, useState } from "react";
import { EMail_Entry } from "./Register/EMail_Entry";
import { UserName_Entry } from "./Register/UserName_Entry";

export default function App() {
  return (
	<>
		<EMail_Entry/>
		<UserName_Entry/>
	</>
	);
}
