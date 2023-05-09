import {
    $applyNodeReplacement,
    DOMConversionMap,
    DOMConversionOutput,
    ElementFormatType,
    LexicalNode,
    NodeKey,
    ParagraphNode,
    SerializedParagraphNode,
    Spread
} from "lexical";
import { EditorConfig } from "lexical";
import { TypographyStylesNode, ThemeStyleValue, TextNodeThemeStyles } from "~/nodes/types";
import { WebinyTheme } from "~/themes/webinyLexicalTheme";
import { addClassNamesToElement } from "@lexical/utils";
import { findTypographyStyleByHtmlTag } from "~/utils/findTypographyStyleByHtmlTag";
import { ThemeEmotionMap } from "~/types";

export type SerializeBaseParagraphNode = Spread<
    {
        styles: ThemeStyleValue[];
        type: "base-paragraph-node";
    },
    SerializedParagraphNode
>;

export class BaseParagraphNode
    extends ParagraphNode
    implements TextNodeThemeStyles, TypographyStylesNode
{
    __styles: ThemeStyleValue[] = [];

    constructor(typographyStyleId?: string, key?: NodeKey) {
        super(key);

        if (typographyStyleId) {
            this.__styles.push({ styleId: typographyStyleId, type: "typography" });
        }
    }

    protected setDefaultTypography(themeEmotionMap: ThemeEmotionMap) {
        const typographyStyle = findTypographyStyleByHtmlTag("p", themeEmotionMap);
        if (typographyStyle) {
            this.__styles.push({ styleId: typographyStyle.id, type: "typography" });
        }
    }

    setTypography(typographyStyleId: string): this {
        const self = super.getWritable();
        const themeStyle = {
            styleId: typographyStyleId,
            type: "typography"
        } as ThemeStyleValue;
        self.__styles.push(themeStyle);
        return self;
    }

    getTypographyStyleId(): string | undefined {
        const style = this.__styles.find(x => x.type === "typography");
        return style?.styleId || undefined;
    }

    clearTypographyStyle(): this {
        const self = super.getWritable();
        self.__styles = self.__styles.filter(s => s.type !== "typography");
        return self;
    }

    hasTypographyStyle(): boolean {
        return !!this.getTypographyStyleId();
    }

    getThemeStyles(): ThemeStyleValue[] {
        const self = super.getLatest();
        return self.__styles;
    }

    setThemeStyles(styles: ThemeStyleValue[]) {
        const self = super.getWritable();
        self.__styles = [...styles];
        return self;
    }

    static override getType(): string {
        return "base-paragraph-node";
    }

    static override clone(node: BaseParagraphNode): BaseParagraphNode {
        return new BaseParagraphNode(node.getTypographyStyleId(), node.__key);
    }

    protected updateElementWithThemeClasses(element: HTMLElement, theme: WebinyTheme): HTMLElement {
        if (!theme?.emotionMap) {
            return element;
        }

        if (!this.hasTypographyStyle()) {
            this.setDefaultTypography(theme.emotionMap);
        }

        const typoStyleId = this.getTypographyStyleId();

        let themeClasses;

        // Typography css class
        if (typoStyleId) {
            const typographyStyle = theme.emotionMap[typoStyleId];
            if (typographyStyle) {
                themeClasses = typographyStyle.className;
            }
        }

        if (themeClasses) {
            addClassNamesToElement(element, themeClasses);
        }

        return element;
    }

    // View
    override createDOM(config: EditorConfig): HTMLElement {
        const element = super.createDOM(config);
        return this.updateElementWithThemeClasses(element, config.theme as WebinyTheme);
    }

    override updateDOM(
        prevNode: BaseParagraphNode,
        dom: HTMLElement,
        config: EditorConfig
    ): boolean {
        const prevTypoStyleId = prevNode.getTypographyStyleId();
        const nextTypoStyleId = this.getTypographyStyleId();

        if (!nextTypoStyleId) {
            this.updateElementWithThemeClasses(dom, config.theme as WebinyTheme);
            return false;
        }

        if (prevTypoStyleId !== nextTypoStyleId && nextTypoStyleId) {
            this.updateElementWithThemeClasses(dom, config.theme as WebinyTheme);
        }
        return false;
    }

    static override importDOM(): DOMConversionMap | null {
        return {
            p: () => ({
                conversion: convertParagraphElement,
                priority: 0
            })
        };
    }

    static override importJSON(serializedNode: SerializeBaseParagraphNode): BaseParagraphNode {
        const node = $createBaseParagraphNode();
        node.setFormat(serializedNode.format);
        node.setIndent(serializedNode.indent);
        node.setDirection(serializedNode.direction);
        node.setThemeStyles(serializedNode.styles);
        return node;
    }

    override exportJSON(): SerializeBaseParagraphNode {
        return {
            ...super.exportJSON(),
            styles: this.__styles,
            type: "base-paragraph-node",
            version: 1
        };
    }
}

function convertParagraphElement(element: HTMLElement): DOMConversionOutput {
    const node = $createBaseParagraphNode();
    if (element.style) {
        node.setFormat(element.style.textAlign as ElementFormatType);
    }

    return { node };
}

export function $createBaseParagraphNode(typographyStyleId?: string): BaseParagraphNode {
    return $applyNodeReplacement(new BaseParagraphNode(typographyStyleId));
}

export function $isBaseParagraphNode(
    node: LexicalNode | null | undefined
): node is BaseParagraphNode {
    return node instanceof BaseParagraphNode;
}
