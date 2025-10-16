import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import Card from '@site/src/components/Card';
import CardBody from '@site/src/components/Card/CardBody';
import CardFooter from '@site/src/components/Card/CardFooter';
import CardHeader from '@site/src/components/Card/CardHeader';
import CardImage from '@site/src/components/Card/CardImage';
import Columns from '@site/src/components/Columns';
import Column from '@site/src/components/Columns/Column';
import Timeline from '@site/src/components/TimeLine';
import TimelineItem from '@site/src/components/TimeLine/TimeLineItem';
import { Steps, Step } from '@site/src/components/Steps';
export default {
  ...MDXComponents,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardImage,
  Columns,
  Column,
  Timeline,
  TimelineItem,
  Steps,
  Step,
};