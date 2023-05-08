import Code from "@editorjs/code";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import Image from "@editorjs/image";
import Checklist from "@editorjs/checklist";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import Warning from "@editorjs/warning";
import Delimiter from "@editorjs/delimiter";
import Table from "@editorjs/table";
import LinkTool from "@editorjs/link";
import Embed from "@editorjs/embed";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import Raw from "@editorjs/raw";
import React, { memo, useEffect, useState, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import { OutputData } from "@editorjs/editorjs";
import { FiTrash2, FiEdit } from 'react-icons/fi';
import { validate } from "jsonschema";
import ChatGPT from "./ChatGPT";
import SimpleImage from "@editorjs/simple-image";
// Define the available tools for the EditorJS instance
const EDITOR_TOOLS = {
  code: {
    class: Code,
    inlineToolbar: true,
    InlineCode: true,
  },
  header: {
    class: Header,
    inlineToolbar: true,
  },
  paragraph: {
    class: Paragraph,
    inlineToolbar: true,
  },
  image: Image,
  checklist: Checklist,
  list: List,
  quote: Quote,
  // warning: Warning,
  // delimiter: Delimiter,
  table: Table,
  linkTool: LinkTool,
  embed: Embed,
  marker: Marker,
  inlineCode: InlineCode,
  // raw: Raw,
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

const EditorBlock = ({ data, onChange, holder, currUser }: Props) => {
  const ref = useRef<any>(); // Use any type for EditorJS
  const [blocks, setBlocks] = useState<any[]>([]);
  const [editingBlockId, setEditingBlockId] = useState(null);

  console.log("currUser", currUser);

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
        holder: holder,
        tools: EDITOR_TOOLS,
        data,
        async onChange(api, event) {
          const data = await api.saver.save();
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
    if (!content) {
      return ''; // Return empty string if content is undefined or null
    }
    const sanitizedContent = content.replace(/<\/?(b|i)>/g, ''); // Remove <b> and </b> tags, and <i> and </i> tags
    return sanitizedContent;
  };

  // Save the blocks to the server
  const handleSave = async () => {
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

      // Find the block to update
      const blockToUpdate = savedData.blocks.find((block) => block.id === blockId);
      if (!blockToUpdate) {
        throw new Error(`Block with ID ${blockId} not found`);
      }

      // Create a copy of the current state using the spread operator
      const updatedBlocks = [...blocks];

      // Find the index of the block to update in the updatedBlocks array
      const blockIndex = blocks.findIndex((block) => block.id === blockId);

      // Update the specific block with the new data
      updatedBlocks[blockIndex] = {
        ...updatedBlocks[blockIndex],
        blocks: [blockToUpdate], // wrap the block in an array
        time: savedData.time,
        version: savedData.version,
      };

      // Update the state with the updated blocks
      setBlocks(updatedBlocks);

      const response = await fetch(`/blocks/${blockId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blocks: blockToUpdate, // directly assign the updated block
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


  const handleInput = () => {
    console.log("handleInput");
    const content = ref.current.innerHTML;
    console.log("content", content);
  };


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
      <div id={holder} style={{ paddingLeft: '23vw', paddingRight: "7vw", paddingTop: "5vh" }}>
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
          const innerBlocks = Array.isArray(block.blocks) ? block.blocks : [block.blocks];
          return innerBlocks.map((innerBlock) => {
            const sanitizeText = (text) => {
              const temp = document.createElement("div");
              temp.textContent = text;
              return temp.innerHTML;
            };

            const sanitizedText = sanitizeContent(innerBlock.data.text);
            const sanitizedCaption = sanitizeContent(innerBlock.data.caption);
            const sanitizedTitle = sanitizeContent(innerBlock.data.title);
            const sanitizedMessage = sanitizeContent(innerBlock.data.message);

            return (
              <div key={`${block.id}-${innerBlock.id}`} id="editorjs">
                {innerBlock.type === "paragraph" && (
                  <div
                    className="editor-block editor-block--paragraph"
                    style={{ paddingTop: "20px" }}
                  // onChange={(e) => {
                  //   handleInput();
                  // }}
                  // onClick={(e) => {
                  //   e.preventDefault();
                  //   setEditingBlockId((block.id));
                  // }}
                  // contentEditable="true" // Set contentEditable to true
                  // ref={ref}
                  // onInput={handleInput}
                  >
                    <h2
                      className="editor-block__heading"
                      // onClick={(e) => {
                      //   e.preventDefault();
                      // setEditingBlockId((block.id));
                      // }}
                      contentEditable="true" // Set contentEditable to true

                    >
                      {innerBlock.data.text.includes("<b>") &&
                        innerBlock.data.text.includes("</b>") &&
                        innerBlock.data.text.includes("<i>") &&
                        innerBlock.data.text.includes("</i>") ? (
                        <span
                          style={{ fontWeight: "bold", fontStyle: "italic" }}
                          dangerouslySetInnerHTML={{
                            __html: innerBlock.data.text
                              .replace(/<\/?b>/g, "")
                              .replace(/<\/?i>/g, "")
                          }}
                        />
                      ) : innerBlock.data.text.includes("<b>") &&
                        innerBlock.data.text.includes("</b>") ? (
                        <span
                          style={{ fontWeight: "bold" }}
                          dangerouslySetInnerHTML={{
                            __html: innerBlock.data.text
                              .replace(/<\/?b>/g, "")
                              .replace(/<\/?i>/g, "")
                          }}
                        />
                      ) : innerBlock.data.text.includes("<i>") &&
                        innerBlock.data.text.includes("</i>") ? (
                        <span
                          style={{ fontStyle: "italic" }}
                          dangerouslySetInnerHTML={{
                            __html: innerBlock.data.text
                              .replace(/<\/?b>/g, "")
                              .replace(/<\/?i>/g, "")
                          }}
                        />
                      ) : (
                        innerBlock.data.text
                      )}
                    </h2>
                  </div>
                )}
                {innerBlock.type === "code" && (
                  <div className="editor-block editor-block--code" style={{ paddingTop: "20px" }}>
                    <pre className="ce-code__textarea cdx-input" contentEditable>{innerBlock.data.code}</pre>
                  </div>
                )}
                {innerBlock.type === "header" && (
                  <div className="editor-block editor-block--header" style={{ paddingTop: "20px" }}>
                    <h2 className="ce-header" style={{ fontSize: "30px" }}>
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
                    <ul className="editor-block__list">
                      {innerBlock.data.items.map((item, index) => (
                        <li key={index} className="editor-block__list-item">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={(event) => {
                              const updatedItems = [...innerBlock.data.items];
                              updatedItems[index].checked = event.target.checked;
                            }}
                          />
                          {sanitizedText}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {innerBlock.type === "list" && (
                  <div className="ce-block ce-block--focused" style={{ paddingTop: "20px" }}>
                    <ul className="cdx-block cdx-list cdx-list--ordered">
                      {innerBlock.data.items.map((item, index) => (
                        <li key={index} className="cdx-list__item">
                          {sanitizeText(item)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {innerBlock.type === "table" && (
                  <div className="tc-wrap" style={{ paddingTop: "20px" }}>
                    <div className="tc-table">
                      <div className="tc-row">
                        <div className="tc-row">
                          {innerBlock.data.content[0].map((item, index) => (
                            <div key={index} className="tc-cell">{sanitizeText(item)}</div>
                          ))}
                        </div>
                      </div>
                      <div className="">
                        {innerBlock.data.content.slice(1).map((row, index) => (
                          <div key={index} className="tc-row">
                            {row.map((item, index) => (
                              <div key={index} className="tc-cell">{sanitizeText(item)}</div>
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
                <button type="button" onClick={() => {
                  handleEdit(block.id)
                  console.log("block.id", block.id)
                }}>
                  <FiEdit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  style={{
                    boxShadow:
                      "rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px", paddingBottom: "10px"
                  }}
                  className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-2 py-2 text-center flex items-center justify-end ml-auto dark:bg-gray-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                  onClick={() => handleDelete(block.id)}
                >
                  <FiTrash2 className="w-4 h-4" />
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