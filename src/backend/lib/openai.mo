import OutCall "mo:caffeineai-http-outcalls/outcall";
import Text "mo:core/Text";

module {
  public func buildRequestBody(messages : [{ role : Text; content : Text }]) : Text {
    var messagesJson = "";
    var first = true;
    for (msg in messages.values()) {
      if (not first) { messagesJson #= "," };
      first := false;
      messagesJson #= "{\"role\":\"" # escapeJson(msg.role) # "\",\"content\":\"" # escapeJson(msg.content) # "\"}";
    };
    "{\"model\":\"openai\",\"messages\":[" # messagesJson # "],\"private\":true}"
  };

  // Escape special characters for JSON string embedding
  func escapeJson(s : Text) : Text {
    var result = "";
    for (c in s.toIter()) {
      if (c == '\"') {
        result #= "\\\"";
      } else if (c == '\\') {
        result #= "\\\\";
      } else if (c == '\n') {
        result #= "\\n";
      } else if (c == '\r') {
        result #= "\\r";
      } else if (c == '\t') {
        result #= "\\t";
      } else {
        result #= Text.fromChar(c);
      };
    };
    result
  };

  // Extract the assistant message content from the OpenAI-compatible JSON response.
  // Looks for "content":" pattern and extracts the value.
  public func parseResponseContent(json : Text) : Text {
    let marker = "\"content\":\"";
    switch (findSubstring(json, marker)) {
      case null "I'm sorry, I couldn't process that response.";
      case (?startIdx) {
        let afterMarker = startIdx + marker.size();
        extractJsonString(json, afterMarker)
      };
    }
  };

  // Find first occurrence of needle in haystack, return start index
  func findSubstring(haystack : Text, needle : Text) : ?Nat {
    let h = haystack.toArray();
    let n = needle.toArray();
    let hLen = h.size();
    let nLen = n.size();
    if (nLen == 0) return ?0;
    if (hLen < nLen) return null;
    var i = 0;
    label search while (i + nLen <= hLen) {
      var j = 0;
      var matched = true;
      label inner while (j < nLen) {
        if (h[i + j] != n[j]) {
          matched := false;
          break inner;
        };
        j += 1;
      };
      if (matched) return ?i;
      i += 1;
    };
    null
  };

  // Extract a JSON string value starting at `pos` (position after the opening quote)
  func extractJsonString(text : Text, pos : Nat) : Text {
    let chars = text.toArray();
    var result = "";
    var i = pos;
    var escaped = false;
    label extract while (i < chars.size()) {
      let c = chars[i];
      if (escaped) {
        if (c == 'n') { result #= "\n" }
        else if (c == 'r') { result #= "\r" }
        else if (c == 't') { result #= "\t" }
        else { result #= Text.fromChar(c) };
        escaped := false;
      } else if (c == '\\') {
        escaped := true;
      } else if (c == '\u{22}') {
        break extract;
      } else {
        result #= Text.fromChar(c);
      };
      i += 1;
    };
    result
  };

  public func callChatCompletion(
    requestBody : Text,
    transform : OutCall.Transform,
  ) : async Text {
    let url = "https://text.pollinations.ai/openai";
    let headers : [OutCall.Header] = [
      { name = "Content-Type"; value = "application/json" },
    ];
    await OutCall.httpPostRequest(url, headers, requestBody, transform)
  };
};
