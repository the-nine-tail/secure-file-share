"use client";
import styled from "styled-components";
import { Theme } from "~/app/theme";
import {
  WorkSansMedium,
  WorkSansRegular,
  WorkSansSemiBold,
  WorkSansBold,
} from "./fonts";

// Body primary (default font for text)
export const BodyPrimaryRegular = styled.div.attrs({
  className: WorkSansRegular.className,
})<{
  color?: string;
}>`
  font-size: 16px;
  line-height: 24px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

export const BodyPrimaryMedium = styled.div.attrs({
  className: WorkSansMedium.className,
})<{
  color?: string;
}>`
  font-size: 16px;
  line-height: 24px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

export const BodyPrimarySemiBold = styled.div.attrs({
  className: WorkSansSemiBold.className,
})<{
  color?: string;
}>`
  font-size: 16px;
  line-height: 24px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

export const BodyPrimaryBold = styled.div.attrs({
  className: WorkSansBold.className,
})<{
  color?: string;
}>`
  font-size: 16px;
  line-height: 24px;
  color: ${(props) => props.color ?? Theme.text.secondary};
`;

// body secondary (for sub-title and caption)
export const BodySecondaryRegular = styled.div.attrs({
  className: WorkSansRegular.className,
})<{
  color?: string;
}>`
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

export const BodySecondaryMedium = styled.div.attrs({
  className: WorkSansMedium.className,
})<{
  color?: string;
}>`
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

export const BodySecondarySemiBold = styled.div.attrs({
  className: WorkSansSemiBold.className,
})<{
  color?: string;
}>`
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

export const BodySecondaryBold = styled.div.attrs({
  className: WorkSansBold.className,
})<{
  color?: string;
}>`
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

// body teritary (for caption and other very small text)
// body secondary (for sub-title and caption)
export const BodyTertiaryRegular = styled.div.attrs({
  className: WorkSansRegular.className,
})<{
  color?: string;
}>`
  font-size: 12px;
  line-height: 18px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

export const BodyTertiaryMedium = styled.div.attrs({
  className: WorkSansMedium.className,
})<{
  color?: string;
}>`
  font-size: 12px;
  line-height: 18px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

export const BodyTertiarySemiBold = styled.div.attrs({
  className: WorkSansSemiBold.className,
})<{
  color?: string;
}>`
  font-size: 12px;
  line-height: 18px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

export const BodyTertiaryBold = styled.div.attrs({
  className: WorkSansBold.className,
})<{
  color?: string;
}>`
  font-size: 12px;
  line-height: 18px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

//
export const BodyLargeRegular = styled.div.attrs({
  className: WorkSansRegular.className,
})<{
  color?: string;
}>`
  font-size: 18px;
  line-height: 28px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

export const BodyLargeMedium = styled.div.attrs({
  className: WorkSansMedium.className,
})<{
  color?: string;
}>`
  font-size: 18px;
  line-height: 28px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

export const BodyLargeSemiBold = styled.div.attrs({
  className: WorkSansSemiBold.className,
})<{
  color?: string;
}>`
  font-size: 18px;
  line-height: 28px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

export const BodyLargeBold = styled.div.attrs({
  className: WorkSansBold.className,
})<{
  color?: string;
}>`
  font-size: 18px;
  line-height: 28px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

//
export const BodyExtraLargeRegular = styled.div.attrs({
  className: WorkSansRegular.className,
})<{
  color?: string;
}>`
  font-size: 20px;
  line-height: 30px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

export const BodyExtraLargeMedium = styled.div.attrs({
  className: WorkSansMedium.className,
})<{
  color?: string;
}>`
  font-size: 20px;
  line-height: 30px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

export const BodyExtraLargeSemiBold = styled.div.attrs({
  className: WorkSansSemiBold.className,
})<{
  color?: string;
  lineHeight?: string;
}>`
  font-size: 20px;
  line-height: ${(props) => props.lineHeight ?? "30px"};
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

export const BodyExtraLargeBold = styled.div.attrs({
  className: WorkSansBold.className,
})<{
  color?: string;
}>`
  font-size: 20px;
  line-height: 30px;
  color: ${(props) => props.color ?? Theme.text.tertiary};
`;

//
export const HeadingPrimaryRegular = styled.div.attrs({
  className: WorkSansRegular.className,
})<{
  color?: string;
}>`
  font-size: 36px;
  line-height: 44px;
  letter-spacing: -1px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const HeadingPrimaryMedium = styled.div.attrs({
  className: WorkSansMedium.className,
})<{
  color?: string;
}>`
  font-size: 36px;
  line-height: 44px;
  letter-spacing: -1px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const HeadingPrimarySemiBold = styled.div.attrs({
  className: WorkSansSemiBold.className,
})<{
  color?: string;
}>`
  font-size: 36px;
  line-height: 44px;
  letter-spacing: -1px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const HeadingPrimaryBold = styled.div.attrs({
  className: WorkSansBold.className,
})<{
  color?: string;
}>`
  font-size: 36px;
  line-height: 44px;
  letter-spacing: -1px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

//
export const HeadingSecondaryRegular = styled.div.attrs({
  className: WorkSansRegular.className,
})<{
  color?: string;
}>`
  font-size: 30px;
  line-height: 38px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const HeadingSecondaryMedium = styled.div.attrs({
  className: WorkSansMedium.className,
})<{
  color?: string;
}>`
  font-size: 30px;
  line-height: 38px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const HeadingSecondarySemiBold = styled.div.attrs({
  className: WorkSansSemiBold.className,
})<{
  color?: string;
}>`
  font-size: 30px;
  line-height: 38px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const HeadingSecondaryBold = styled.div.attrs({
  className: WorkSansBold.className,
})<{
  color?: string;
}>`
  font-size: 30px;
  line-height: 38px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

//
export const HeadingTertiaryRegular = styled.div.attrs({
  className: WorkSansRegular.className,
})<{
  color?: string;
}>`
  font-size: 24px;
  line-height: 32px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const HeadingTertiaryMedium = styled.div.attrs({
  className: WorkSansMedium.className,
})<{
  color?: string;
}>`
  font-size: 24px;
  line-height: 32px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const HeadingTertiarySemiBold = styled.div.attrs({
  className: WorkSansSemiBold.className,
})<{
  color?: string;
}>`
  font-size: 24px;
  line-height: 32px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const HeadingTertiaryBold = styled.div.attrs({
  className: WorkSansBold.className,
})<{
  color?: string;
}>`
  font-size: 24px;
  line-height: 32px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

//
export const HeadingLargeRegular = styled.div.attrs({
  className: WorkSansRegular.className,
})<{
  color?: string;
}>`
  font-size: 48px;
  line-height: 60px;
  letter-spacing: -1.5px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const HeadingLargeMedium = styled.div.attrs({
  className: WorkSansMedium.className,
})<{
  color?: string;
}>`
  font-size: 48px;
  line-height: 60px;
  letter-spacing: -1.5px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const HeadingLargeSemiBold = styled.div.attrs({
  className: WorkSansSemiBold.className,
})<{
  color?: string;
}>`
  font-size: 48px;
  line-height: 60px;
  letter-spacing: -1.5px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const HeadingLargeBold = styled.div.attrs({
  className: WorkSansBold.className,
})<{
  color?: string;
}>`
  font-size: 48px;
  line-height: 60px;
  letter-spacing: -1.5px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

//
export const HeadingExtraLargeRegular = styled.div.attrs({
  className: WorkSansRegular.className,
})<{
  color?: string;
}>`
  font-size: 60px;
  line-height: 72px;
  letter-spacing: -2px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const HeadingExtraLargeMedium = styled.div.attrs({
  className: WorkSansMedium.className,
})<{
  color?: string;
}>`
  font-size: 60px;
  line-height: 72px;
  letter-spacing: -2px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const HeadingExtraLargeSemiBold = styled.div.attrs({
  className: WorkSansSemiBold.className,
})<{
  color?: string;
}>`
  font-size: 60px;
  line-height: 72px;
  letter-spacing: -2px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const HeadingExtraLargeBold = styled.div.attrs({
  className: WorkSansBold.className,
})<{
  color?: string;
}>`
  font-size: 60px;
  line-height: 72px;
  letter-spacing: -2px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

//
export const Heading2ExtraLargeRegular = styled.div.attrs({
  className: WorkSansRegular.className,
})<{
  color?: string;
}>`
  font-size: 72px;
  line-height: 90px;
  letter-spacing: -2px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const Heading2ExtraLargeMedium = styled.div.attrs({
  className: WorkSansMedium.className,
})<{
  color?: string;
}>`
  font-size: 72px;
  line-height: 90px;
  letter-spacing: -2px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const Heading2ExtraLargeSemiBold = styled.div.attrs({
  className: WorkSansSemiBold.className,
})<{
  color?: string;
}>`
  font-size: 72px;
  line-height: 90px;
  letter-spacing: -2px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;

export const Heading2ExtraLargeBold = styled.div.attrs({
  className: WorkSansBold.className,
})<{
  color?: string;
}>`
  font-size: 72px;
  line-height: 90px;
  letter-spacing: -2px;
  color: ${(props) => props.color ?? Theme.text.primary};
`;
