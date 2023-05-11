import Code from "@editorjs/code";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import Checklist from "@editorjs/checklist";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import Table from "@editorjs/table";
import LinkTool from "@editorjs/link";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import InlineImage from "editorjs-inline-image";
import React, { useEffect, useState, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import { OutputData } from "@editorjs/editorjs";
import { FiTrash2, FiEdit } from 'react-icons/fi';
import ChatGPT from "./ChatGPT";
import Image from "next/image";
import FontFamily from "editorjs-inline-font-family-tool";
import FontSize from "editorjs-inline-font-size-tool";
import debounce from "lodash.debounce";
import editorjsCodeFlask from "@calumk/editorjs-codeflask"
import ColorPlugin from "editorjs-text-color-plugin";
import AlignmentTuneTool from "editorjs-text-alignment-blocktune"



// Define the available tools for the EditorJS instance
const EDITOR_TOOLS = {
  code: {
    class: Code,
    inlineToolbar: true,
    // InlineCode: true,
  },
  header: {
    class: Header,
    inlineToolbar: true,
    tunes: ['AlignmentTuneTool'],
  },
  paragraph: {
    class: Paragraph,
    inlineToolbar: true,
    tunes: ['AlignmentTuneTool'],
  },
  AlignmentTuneTool: {
    class: AlignmentTuneTool,
    config: {
      default: 'left',
      blocks: {
        header: 'center',
        paragraph: 'justify',
      },
    },
  },

  image: {
    class: InlineImage,
    inlineToolbar: true,
    config: {
      embed: {
        display: true,
      },
      unsplash: {
        appName: 'Jam',
        clientId: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
      }
    }
  },
  editorjsCodeFlask: {
    class: editorjsCodeFlask,
    config: {
      languages: [
        { name: 'HTML', syntax: 'html' },
        { name: 'CSS', syntax: 'css' },
        { name: 'JavaScript', syntax: 'javascript' },
        { name: 'TypeScript', syntax: 'typescript' },
        { name: 'JSX', syntax: 'jsx' },
        { name: 'Markdown', syntax: 'markdown' },
        { name: 'Python', syntax: 'python' },
        { name: 'Ruby', syntax: 'ruby' },
        { name: 'PHP', syntax: 'php' },
        { name: 'Java', syntax: 'java' },
        { name: 'C', syntax: 'c' },
        { name: 'C++', syntax: 'cpp' },
        { name: 'C#', syntax: 'csharp' },

      ],
      defaultLanguage: 'javascript',
      theme: 'dark',
      lineNumbers: true,
      lineWrapping: true,
      readOnly: false,
      tabSize: 2,
      indentWithTabs: false,
      autofocus: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      autoCloseTags: true,
      autoCloseBraces: true,
      showTrailingSpace: true,
      highlightSelectionMatches: true,
      lint: true,
      gutters: ['CodeMirror-lint-markers'],
      styleActiveLine: true,
      foldGutter: true,
      foldOptions: {
        widget: '⋯',
      },
      extraKeys: {
        'Ctrl-Space': 'autocomplete',
        'Ctrl-Enter': function (cm) {
          cm.replaceSelection('\n');
        },
        'Ctrl-/': 'toggleComment',
        'Ctrl-J': 'toMatchingTag',
        'Ctrl-Q': function (cm) {

        },

      },

    },
  },
  Color: {
    class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
    config: {
      colorCollections: ['#EC7878', '#9C27B0', '#673AB7', '#3F51B5', '#0070FF', '#03A9F4', '#00BCD4', '#4CAF50', '#8BC34A', '#CDDC39', '#FFF'],
      defaultColor: '#FF1300',
      type: 'text',
      customPicker: true // add a button to allow selecting any colour  
    }
  },
  checklist: Checklist,
  list: List,
  quote: Quote,
  table: Table,
  linkTool: LinkTool,
  Marker: {
    class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
    config: {
      defaultColor: '#FFBF00',
      type: 'marker',
      icon: `<svg fill="#000000" height="200px" width="200px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M17.6,6L6.9,16.7c-0.2,0.2-0.3,0.4-0.3,0.6L6,23.9c0,0.3,0.1,0.6,0.3,0.8C6.5,24.9,6.7,25,7,25c0,0,0.1,0,0.1,0l6.6-0.6 c0.2,0,0.5-0.1,0.6-0.3L25,13.4L17.6,6z"></path> <path d="M26.4,12l1.4-1.4c1.2-1.2,1.1-3.1-0.1-4.3l-3-3c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9L19,4.6L26.4,12z"></path> </g> <g> <path d="M28,29H4c-0.6,0-1-0.4-1-1s0.4-1,1-1h24c0.6,0,1,0.4,1,1S28.6,29,28,29z"></path> </g> </g></svg>`
    }
  },
  inlineCode: InlineCode,
  fontFamily: FontFamily,
  fontSize: FontSize,
};

// Define the types used in the component
type OutputData = {
  id: string;
  blocks: Block[];
  time: number;
  version: string;
};

type Block = {
  type: string;
  data: any;
  id: any;
};

type Props = {
  data?: OutputData;
  onChange(val: OutputData): void;
  holder: string;
  currUser: { id: string };
};

// style ce-popover ce-popover--opened {

// }

const EditorBlock = ({ data, onChange, holder, currUser }: Props) => {
  const ref = useRef<any>(); // Use any type for EditorJS
  const [blocks, setBlocks] = useState<any[]>([]);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [input, setInput] = useState([]);

  // console.log("currUser", currUser);

  // Fetch the blocks when the current user changes
  useEffect(() => {
    const user_id = currUser?.id;

    if (user_id) {
      fetch(`/blocks?user_id=${user_id}`)
        .then((r) => {
          if (!r.ok) {
            throw new Error("Something went wrong");
          }
          return r.json();
        })
        .then((parsedData) => {
          setBlocks(parsedData);
        })
        .catch((error) => {
          console.log("Error fetching blocks", error);
        });
    }
  }, [currUser]);

  // Initialize the EditorJS instance when the component mounts
  useEffect(() => {
    if (!ref.current) {
      const editor = new EditorJS({
        // onReady: () => {
        // new DragDrop(editor);
        // },
        holder: holder,
        tools: EDITOR_TOOLS,
        data,
        async onChange(api, event) {
          const data = await api.saver.save(event);
          onChange(data);
        },
      });
      ref.current = editor;
    }

    return () => {
      if (ref.current && ref.current.destroy) {
        ref.current.destroy();
      }
    };
  }, []);

  // Sanitize the content to remove specific HTML tags
  const sanitizeContent = (content: string): string => {
    if (typeof content !== 'string') {
      return '';
    }
    let sanitizedContent = content.replace(/<\/?(b|i)>/g, ''); // Remove <b> and </b> tags, and <i> and </i> tags
    sanitizedContent = sanitizedContent.replace(/@@@(.*?)@@@/g, '<mark>$1</mark>'); // Replace @@@...@@@ with <mark>...</mark>
    sanitizedContent = sanitizedContent.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>'); // Replace URLs with <a> tags
    sanitizedContent = sanitizedContent.replace(/&nbsp;/g, ' '); // Add target="_blank" to <a> tags
    return sanitizedContent;
  };




  // Save the blocks to the server
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Save the data from the EditorJS instance
      const savedData = await ref.current.save();
      const blockData = savedData.blocks.map((block) => ({
        type: block.type,
        data: block.data,
        id: block.id,
      }));
      const timeData = savedData.time;
      const versionData = savedData.version;
      const userId = currUser.id;

      const response = await fetch("/blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blocks: blockData,
          time: timeData,
          version: versionData,
          user_id: userId,
        }),
      });

      // Handle the response
      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      const parsedData = await response.json();
      setBlocks(parsedData);
      console.log("parsedData", parsedData);

      // Fetch the updated blocks list
      const updatedResponse = await fetch(`/blocks?user_id=${currUser.id}`);

      if (!updatedResponse.ok) {
        throw new Error("Something went wrong");
      }

      const updatedData = await updatedResponse.json();
      setBlocks(updatedData);
    } catch (error) {
      console.log("Error saving or fetching blocks", error);
    }

  };

  const handleUpdate = async (blockId) => {
    try {
      console.log("editingBlockId", blockId);

      // Save the data from the EditorJS instance
      const savedData = await ref.current.save();
      console.log("ref", ref);
      console.log("ref.current", ref.current);
      console.log("savedData", savedData);

      // Create a copy of the current state using the spread operator
      const updatedBlocks = [...blocks];

      // Update the state with the updated blocks
      setBlocks(updatedBlocks);

      const response = await fetch(`/blocks/${blockId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blocks: {
            data: { text: [input] },
            id: blockId,
            type: "paragraph",
          }, // directly assign the updated block
          time: savedData.time,
          version: savedData.version,
          user_id: currUser.id,
        }),
      });

      // Handle the response
      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      // ...
    } catch (error) {
      console.log("Error updating block", error);
    }
  };

  const handleInput = (e) => {
    console.log("e.target.textContent", e.target.textContent);

    setInput(e.target.textContent);

  }



  const handleEdit = (blockId) => {
    console.log("blocks", blocks);
    console.log("blockId", blockId);

    setEditingBlockId(blockId);
    handleUpdate(blockId);
  };

  const handleDelete = (blockId) => {
    console.log("blockId", blockId);
    fetch(`/blocks/${blockId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong");
        }
        console.log("Block deleted successfully");

        // Fetch the updated blocks list
        fetch(`/blocks?user_id=${currUser.id}`)
          .then((r) => {
            if (!r.ok) {
              throw new Error("Something went wrong");
            }
            return r.json();
          })
          .then((parsedData) => {
            setBlocks(parsedData);
          })
          .catch((error) => {
            console.log("Error fetching blocks", error);
          });
      })
      .catch((error) => {
        console.log("Error deleting block", error);
      });
  };

  return (
    <>
      <div id={holder} style={{ paddingLeft: '24vw', paddingRight: "12vw", paddingTop: "7vh", paddingBottom: '8vh' }}>
        <ChatGPT />
        <button
          id="saveButton"
          onClick={handleSave}
          style={{
            boxShadow: "rgba(0, 0, 0, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px",
          }}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-end ml-auto dark:bg-gray-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          <span className="flex items-center">
            <span className="">Save</span>
          </span>
        </button>
        {blocks.map((block) => {
          // console.log("block", block.id);
          // console.log("editingBlockId", editingBlockId);
          const innerBlocks = Array.isArray(block.blocks) ? block.blocks : [block.blocks];
          return innerBlocks.map((innerBlock) => {
            // console.log("innerBlock", innerBlock)
            const sanitizeText = (text) => {
              const temp = document.createElement("div");
              temp.textContent = text;
              return temp.innerHTML;
            };

            const sanitizedText = sanitizeContent(innerBlock.data.text);
            const sanitizedCaption = sanitizeContent(innerBlock.data.caption);
            const sanitizedTitle = sanitizeContent(innerBlock.data.title);
            const sanitizedMessage = sanitizeContent(innerBlock.data.message);
            const debouncedSave = debounce(handleUpdate, 1000);

            return (
              <div key={`${block.id}-${innerBlock.id}`}
                style={{ fontSize: "20px", lineHeight: "1.5", fontFamily: "Roboto, sans-serif" }}
                id="editorjs">
                {innerBlock.type === "paragraph" && (
                  <div className="editor-block editor-block--paragraph" style={{ paddingTop: "30px" }}>
                    <h2
                      draggable="true"
                      contentEditable="true"
                      suppressContentEditableWarning={true}
                      onBlur={() => debouncedSave(block.id)}
                      onClick={() => setEditingBlockId(block.id)}
                      onInput={handleInput}
                      className="editor-block__heading"
                    >
                      {innerBlock.data.text.includes("<b>") && innerBlock.data.text.includes("</b>") && innerBlock.data.text.includes("<i>") && innerBlock.data.text.includes("</i>") ? (
                        <span style={{ fontWeight: "bold", fontStyle: "italic" }} dangerouslySetInnerHTML={{
                          __html: innerBlock.data.text
                            .replace(/<\/?b>/g, "")
                            .replace(/<\/?i>/g, "")
                            .replace(/<mark[^>]*>(.*?)<\/mark>/g, '<span style="background-color: yellow;">$1</span>')
                            .replace(/<a[^>]*>(.*?)<\/a>/g, '$1')
                        }} />
                      ) : innerBlock.data.text.includes("<b>") && innerBlock.data.text.includes("</b>") ? (
                        <span style={{ fontWeight: "bold" }} dangerouslySetInnerHTML={{
                          __html: innerBlock.data.text
                            .replace(/<\/?b>/g, "")
                            .replace(/<\/?i>/g, "")
                            .replace(/<mark[^>]*>(.*?)<\/mark>/g, '<span style="background-color: yellow;">$1</span>')
                            .replace(/<a[^>]*>(.*?)<\/a>/g, '$1')
                        }} />
                      ) : innerBlock.data.text.includes("<i>") && innerBlock.data.text.includes("</i>") ? (
                        <span style={{ fontStyle: "italic" }} dangerouslySetInnerHTML={{
                          __html: innerBlock.data.text
                            .replace(/<\/?b>/g, "")
                            .replace(/<\/?i>/g, "")
                            .replace(/<mark[^>]*>(.*?)<\/mark>/g, '<span style="background-color: yellow;">$1</span>')
                            .replace(/<a[^>]*>(.*?)<\/a>/g, '$1')
                        }} />
                      ) : innerBlock.data.text.includes('<mark class="cdx-marker">') && innerBlock.data.text.includes("</mark>") ? (
                        <span style={{ backgroundColor: "yellow" }} dangerouslySetInnerHTML={{
                          __html: innerBlock.data.text
                            .replace(/<mark[^>]*>/g, '<mark>')
                            .replace(/<\/?b>/g, "")
                            .replace(/<\/?i>/g, "")
                            .replace(/<mark>(.*?)<\/mark>/g, '<span style="background-color: yellow;">$1</span>')
                            .replace(/<a[^>]*>(.*?)<\/a>/g, '$1')
                        }} />
                      ) : (
                        <span dangerouslySetInnerHTML={{
                          __html: innerBlock.data.text
                          //   .replace(/<a href="(.*?)">(.*?)<\/a>/g, '<a href="$1" target="_blank">$2</a>')
                          //   .replace(/<mark[^>]*>(.*?)<\/mark>/g, '<span style="background-color: yellow;">$1</span>')
                        }} />
                      )}
                    </h2>
                    <button type="button" onClick={() => {
                      handleEdit(block.id)
                      console.log("block.id", block.id)
                    }}>
                      <FiEdit className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {innerBlock.type === "code" && (
                  <div className="editor-block editor-block--code" style={{ paddingTop: "20px" }}>
                    <pre className="ce-code__textarea cdx-input" draggable={true} contentEditable={true}
                      suppressContentEditableWarning={true}
                    >{innerBlock.data.code}</pre>
                  </div>
                )}
                {innerBlock.type === "header" && (
                  <div className="editor-block editor-block--header" style={{ paddingTop: "20px" }}>
                    <h2 className="ce-header" >
                      {innerBlock.data.text.includes("<b>") &&
                        innerBlock.data.text.includes("</b>") &&
                        innerBlock.data.text.includes("<i>") &&
                        innerBlock.data.text.includes("</i>") ? (
                        <span style={{ fontWeight: "bold", fontStyle: "italic" }}>
                          {innerBlock.data.text
                            .replace(/<\/?b>/g, "")
                            .replace(/<\/?i>/g, "")}
                        </span>
                      ) : innerBlock.data.text.includes("<b>") &&
                        innerBlock.data.text.includes("</b>") ? (
                        <span style={{ fontWeight: "bold" }}>
                          {innerBlock.data.text
                            .replace(/<\/?b>/g, "")
                            .replace(/<\/?i>/g, "")}
                        </span>
                      ) : innerBlock.data.text.includes("<i>") &&
                        innerBlock.data.text.includes("</i>") ? (
                        <span style={{ fontStyle: "italic" }}>
                          {innerBlock.data.text
                            .replace(/<\/?b>/g, "")
                            .replace(/<\/?i>/g, "")}
                        </span>
                      ) : (
                        innerBlock.data.text
                      )}
                    </h2>
                  </div>
                )}
                {innerBlock.type === "checklist" && (
                  <div className="editor-block editor-block--checklist" style={{ paddingTop: "20px" }}>
                    <ul className="editor-block__checklist">
                      {innerBlock.data.items.map((item, index) => (
                        <li key={index} className="editor-block__checklist-item">
                          <input
                            contentEditable="true"
                            suppressContentEditableWarning={true}
                            type="checkbox"
                            checked={item.checked}
                            onChange={(event) => {
                              const updatedItems = [...innerBlock.data.items];
                              updatedItems[index].checked = event.target.checked;
                            }}
                          // style={{ marginRight: "10px" }}
                          />
                          <div dangerouslySetInnerHTML={{ __html: item.text }}>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {innerBlock.type === "list" && (
                  <div className="ce-block ce-block--focused" style={{ paddingTop: "20px" }}>
                    <ul className={`cdx-block cdx-list ${innerBlock.data.style === "ordered" ? "cdx-list--ordered" : "cdx-list--unordered"}`}>
                      {innerBlock.data.items.map((item, index) => (
                        <li key={index} className="cdx-list__item">
                          {/* <input readOnly /> */}
                          <span dangerouslySetInnerHTML={{ __html: item }}></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {innerBlock.type === "table" && (
                  <div className="tc-wrap" style={{ paddingTop: "20px" }}>
                    <div className="tc-table">
                      <div className="tc-row">
                        {innerBlock.data.content[0].map((item, index) => (
                          <div key={index} className="tc-cell" style={{ fontWeight: "bold", fontSize: "18px", border: "3px solid black" }}>{sanitizeText(item)}</div>
                        ))}
                      </div>
                      <div className="" style={{ border: "1px solid black" }}>
                        {innerBlock.data.content.slice(1).map((row, index) => (
                          <div key={index} className="tc-row" style={{ border: "1px solid black" }}>
                            {row.map((item, index) => (
                              <div key={index} className="tc-cell" style={{ padding: "5px" }}>{sanitizeText(item)}</div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {innerBlock.type === "quote" && (
                  <div className="editor-block editor-block--quote" style={{ paddingTop: "20px" }}>
                    <blockquote className="editor-block__quote">
                      <p>{sanitizedText}</p>
                      <cite>{sanitizedCaption}</cite>
                    </blockquote>
                  </div>
                )}
                {innerBlock.type === "warning" && (
                  <div className="editor-block editor-block--warning" style={{ paddingTop: "20px" }}>
                    <div className="cdx-block cdx-warning">
                      <p className="cdx-input cdx-warning__title">{sanitizedTitle}</p>
                      <p className="cdx-input cdx-warning__message">{sanitizedMessage}</p>
                    </div>
                  </div>
                )}
                {innerBlock?.type === "image" && (
                  <div className="ce-block" style={{ paddingTop: "20px" }}>
                    <div className="cdx-block inline-image">
                      <div className={`inline-image__picture ${innerBlock?.data?.stretched ? "inline-image__picture--stretched" : ""}`}>
                        {innerBlock?.data && (
                          <>
                            <Image
                              style={{ borderRadius: "10px" }}
                              src={innerBlock.data.url}
                              alt={innerBlock.data.caption}
                              width={500}
                              height={500}
                            />
                            <p style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
                              {innerBlock.data.caption}
                            </p>
                          </>

                        )}
                      </div>

                      {/* <div className="image-tool__caption">{sanitizedCaption}</div> */}
                    </div>
                  </div>
                )}
                {innerBlock.type === "linkTool" && (
                  <div className="editor-block editor-block--link" style={{
                    paddingTop: "20px",
                    color: "blue"
                  }}>
                    <div className="cdx-block cdx-link">
                      {innerBlock?.data && (
                        <a href={innerBlock.data.link}>
                          {innerBlock.data.meta.title || innerBlock.data.link}
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {innerBlock.type === "editorjsCodeFlask" && (
                  <div className="editor-block editor-block--code" style={{ paddingTop: "20px" }}>
                    <pre className="ce-code__textarea cdx-input" draggable={true} contentEditable={true}
                      suppressContentEditableWarning={true}
                    >{innerBlock.data.code}</pre>
                  </div>
                )}
                <button
                  type="button"
                  style={{
                    boxShadow: "rgba(50, 50, 105, 0.15) 0px 2px 5px 0px, rgba(0, 0, 0, 0.05) 0px 1px 1px 0px;", paddingBottom: "5px"
                  }}
                  className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-2 py-2 text-center flex items-center justify-end ml-auto dark:bg-gray-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                  onClick={() => handleDelete(block.id)}
                >
                  <FiTrash2 className="w-8 h-5" />
                </button>
              </div>
            );
          });
        })}

      </div >
    </>
  );
};
export default EditorBlock;