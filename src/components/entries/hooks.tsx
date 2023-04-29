import React, { useState, useEffect } from 'react';
import { CollectionsApiResponse, PeopleApiResponse } from "@rhodesjason/loxdb/dist/common/types/api";
import { Collection, Person } from "@rhodesjason/loxdb/dist/db/entities";
import { callApi } from '../../hooks/useApi';

export function useGetPeople(ids?: number[]) {
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    async function retrieve() {
      if (typeof ids === "undefined" || ids.length === 0) {
        setPeople([]);
      } else {
        const response = await callApi<PeopleApiResponse>(`/api/people?ids=${ids.join(',')}`);
        setPeople(response?.data?.people || []);
      }
    }
    retrieve();
  }, [ids]);
  
  
  return people;
}

export function useGetCollections(ids?: number[]) {
  const [collections, setCollections] = useState<Pick<Collection, "id" | "name">[]>([]);

  useEffect(() => {
    async function retrieve() {
      if (typeof ids === "undefined" || ids.length === 0) {
        setCollections([]);
      } else {
        const response = await callApi<CollectionsApiResponse>(`/api/collections?ids=${ids.join(',')}`);
        setCollections(response?.data?.collections || []);
      }
    }
    retrieve();
  }, [ids]);
  
  
  return collections;
}